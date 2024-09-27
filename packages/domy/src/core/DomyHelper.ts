import { cspEvaluate } from '../utils/cspEvaluate';
import { evaluate } from '../utils/evaluate';
import { getContext } from '../utils/getContext';
import * as ReactiveUtils from '@domyjs/reactive';
import { queueJob } from './scheduler';
import { Listener, OnSetListener } from '@domyjs/reactive/src/core/ReactiveVariable';
import { State } from '../types/State';
import { Config } from '../types/Config';
import { directivesUtils } from '../utils/directivesUtils';
import { DomyDirectiveHelper } from '../types/Domy';
import { createDeepRenderFn } from './deepRender';
import { getDomyAttributeInformations } from '../utils/domyAttrUtils';

let domyHelperId = 0;

/**
 * Domy helper class that handle dependencie change and give everything we need
 *
 * @author yoannchb-pro
 */
export class DomyHelper {
  private domyHelperId = ++domyHelperId;

  private onSetListener: OnSetListener | null = null;

  private cleanupFn: (() => Promise<void> | void) | null = null;
  private effectFn: (() => Promise<void> | void) | null = null;

  public prefix: string = '';
  public directive: string = '';
  public attrName: string = ''; // The attribute name without the modifiers and prefix
  public attr: { name: string; value: string } = { name: '', value: '' };
  public modifiers: string[] = [];

  // The name of a variable don't make it unique because we can declare the same variable name for an other DOMY instance
  // It happend because domy have a globalWatcher when it evaluate a code to check dependencies
  private objectsIdToListen = new Set<number>();
  // Allow us to only update if a the correct property have been update
  // Let's imagine a deep property has been updated data.todoList.0
  // We wan't to update only if this property has been update and not when an other property has been modified (example: data.todoList.1)
  // It happend because the id only identifie the first level (so data and data.todoList have the same id)
  private paths = new Set<string>();

  constructor(
    private deepRenderFn: ReturnType<typeof createDeepRenderFn>,
    public el: Element,
    public setEl: (element: Element) => void,
    public state: State,
    public scopedNodeData: Record<string, any>[] = [],
    public config: Config
  ) {}

  getPluginHelper(renderWithoutListeningToChange = false): DomyDirectiveHelper {
    const evaluateWithoutListening = this.evaluateWithoutListening.bind(this);

    return {
      domyHelperId: this.domyHelperId,
      el: this.el,
      state: this.state,
      scopedNodeData: this.scopedNodeData,
      config: this.config,

      prefix: this.prefix,
      directive: this.directive,
      modifiers: this.modifiers,

      attrName: this.attrName,
      attr: this.attr,

      ...ReactiveUtils,
      utils: directivesUtils,

      setEl: this.setEl,
      queueJob,
      effect: this.effect.bind(this),
      cleanup: this.cleanup.bind(this),
      evaluate: renderWithoutListeningToChange
        ? evaluateWithoutListening
        : this.evaluate.bind(this),
      evaluateWithoutListening,
      deepRender: this.deepRenderFn,
      addScopeToNode: this.addScopeToNode.bind(this),
      removeScopeToNode: this.removeScopeToNode.bind(this),
      removeLastAddedScope: this.removeLastAddedScope.bind(this),
      getContext
    };
  }

  copy() {
    return new DomyHelper(
      this.deepRenderFn,
      this.el,
      this.setEl,
      this.state,
      [...this.scopedNodeData], // Ensure the scoped node data of the current node are not affected by the next operations (like removing the scoped data in d-for)
      this.config
    );
  }

  setAttrInfos(attr: Attr) {
    const attrInfos = getDomyAttributeInformations(attr);
    this.prefix = attrInfos.prefix;
    this.directive = attrInfos.directive;
    this.modifiers = attrInfos.modifiers;
    this.attrName = attrInfos.attrName; // The attribute name without the modifiers and prefix (examples: d-on:click.{enter} -> click)
    this.attr.name = attr.name; // the full attribute name
    this.attr.value = attr.value;
  }

  attachOnSetListener() {
    if (this.onSetListener) return;

    // Allow us to call the effect when a dependencie change
    this.onSetListener = {
      type: 'onSet',
      fn: ({ path, objectId }) => {
        if (!this.objectsIdToListen.has(objectId)) return;

        for (const listenedPath of this.paths) {
          if (ReactiveUtils.matchPath(listenedPath, path).isMatching) {
            this.callEffect();
          }
        }
      }
    };

    ReactiveUtils.globalWatch(this.onSetListener);
  }

  effect(cb: () => void | Promise<void>) {
    this.effectFn = cb;
  }

  cleanup(cb: () => void | Promise<void>) {
    this.cleanupFn = cb;
  }

  eval(code: string) {
    const evaluator = this.config.CSP ? cspEvaluate : evaluate;
    const context = getContext({
      domyHelperId: this.domyHelperId,
      el: this.el,
      state: this.state,
      scopedNodeData: this.scopedNodeData,
      config: this.config
    });

    const executedValued = evaluator({
      code: code,
      contextAsGlobal: !this.config.avoidDeprecatedWith,
      context,
      returnResult: true
    });
    return executedValued;
  }

  evaluate(code: string) {
    const listener: Listener = {
      type: 'onGet',
      fn: ({ path, objectId }) => {
        this.attachOnSetListener(); // Only attach a onSet listener if we have a dependencie
        this.objectsIdToListen.add(objectId);
        this.paths.add(path);
      }
    };

    const unwatch = ReactiveUtils.globalWatch(listener);

    let executedValue;
    let errorMsg;
    try {
      executedValue = this.eval(code);
    } catch (err: any) {
      errorMsg = err;
    }

    unwatch();

    if (errorMsg) throw errorMsg; // We want to throw the error later to ensure we removed the global watcher

    return executedValue;
  }

  evaluateWithoutListening(code: string) {
    return this.eval(code);
  }

  addScopeToNode(obj: Record<string, any>) {
    this.scopedNodeData.push(obj);
  }

  removeScopeToNode(obj: Record<string, any>) {
    const index = this.scopedNodeData.findIndex(o => o === obj);
    if (index !== -1) this.scopedNodeData.splice(index, 1);
  }

  removeLastAddedScope() {
    this.scopedNodeData.pop();
  }

  getUnmountFn() {
    return this.callCleanup.bind(this);
  }

  callCleanup() {
    queueJob(() => {
      if (this.onSetListener) ReactiveUtils.removeGlobalWatch(this.onSetListener);
      this.effectFn = null; // Ensure we don't have effect on the element anymore
      if (typeof this.cleanupFn === 'function') this.cleanupFn();
      this.cleanupFn = null;
    });
  }

  callEffect() {
    // We remove every paths/objectsIdToListen every times the effect is called because the dependencies to watch can be differents
    this.paths = new Set();
    this.objectsIdToListen = new Set();
    if (typeof this.effectFn === 'function') queueJob(this.effectFn.bind(this));
  }
}
