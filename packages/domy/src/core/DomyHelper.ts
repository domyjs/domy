import { Config } from '../types/Config';
import { DomyDirectiveHelper } from '../types/Domy';
import { State } from '../types/State';
import { cspEvaluate } from '../utils/cspEvaluate';
import { evaluate } from '../utils/evaluate';
import { getContext } from '../utils/getContext';
import { createConfigurableDeepRender } from './deepRender';

import * as ReactiveUtils from './reactive';
import { queueJob } from './scheduler';

/**
 * Domy helper class that handle dependencie change and give everything we need
 *
 * @author yoannchb-pro
 */
export class DomyHelper {
  private onSetListener: ReactiveUtils.OnSetListener | null = null;

  private cleanupFn: (() => Promise<void> | void) | null = null;
  private effectFn: (() => Promise<void> | void) | null = null;

  public prefix: string = '';
  public directive: string = '';
  public attrName: string = ''; // The attribute name without the modifiers and prefix
  public attr: { name: string; value: string } = { name: '', value: '' };
  public modifiers: string[] = [];

  // We need to know the objectId because in compositionMode we don't know the variable name
  // And even if we can know it with registerName it don't make it unique because we can declare the same variable name for an other DOMY instance
  // Or if the hook is called more than one time
  private objectsIdToListen = new Set<number>();
  // Allow us to only update if a the correct property have been update
  // Let's imagine a deep property has been updated data.todoList.0
  // We wan't to update only if this property has been update and not when an other property has been modified (example: data.todoList.1)
  // It happend because the id only identifie the first level (so data and data.todoList have the same id)
  private paths = new Set<string>();

  constructor(
    private deepRenderFn: ReturnType<typeof createConfigurableDeepRender>,
    public el: Element,
    public state: State,
    public scopedNodeData: Record<string, any>[] = [],
    public config: Config
  ) {}

  getPluginHelper(renderWithoutListeningToChange = false): DomyDirectiveHelper {
    const evaluateWithoutListening = this.evaluateWithoutListening.bind(this);

    return {
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
      getContext
    };
  }

  attachOnSetListener() {
    if (this.onSetListener) return;

    this.onSetListener = {
      type: 'onSet',
      fn: ({ path, objectId }) => {
        if (!this.objectsIdToListen.has(objectId)) return;

        for (const listenedPath of this.paths) {
          if (ReactiveUtils.matchPath(listenedPath, path).isMatching) {
            this.callCleanup();
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
    const executedValued = evaluator({
      code: code,
      contextAsGlobal: !this.config.avoidDeprecatedWith,
      context: getContext(this.el, this.state, this.scopedNodeData),
      returnResult: true
    });
    return executedValued;
  }

  evaluate(code: string) {
    const listener: ReactiveUtils.Listener = {
      type: 'onGet',
      fn: ({ path, objectId }) => {
        this.attachOnSetListener();
        this.objectsIdToListen.add(objectId);
        this.paths.add(path);
      }
    };

    ReactiveUtils.globalWatch(listener);

    let executedValue;
    let errorMsg;
    try {
      executedValue = this.eval(code);
    } catch (err: any) {
      errorMsg = err;
    }

    ReactiveUtils.removeGlobalWatch(listener);

    if (errorMsg) throw errorMsg; // We want to throw the error later to ensure we removed the global watcher

    return executedValue;
  }

  evaluateWithoutListening(code: string) {
    return this.eval(code);
  }

  addScopeToNode(obj: Record<string, any>) {
    this.scopedNodeData.unshift(obj);
  }

  removeScopeToNode(obj: Record<string, any>) {
    const index = this.scopedNodeData.findIndex(o => o === obj);
    if (index !== -1) this.scopedNodeData.splice(index, 1);
  }

  callCleanup() {
    if (typeof this.cleanupFn === 'function') queueJob(this.cleanupFn.bind(this));
  }

  callEffect() {
    // We remove every paths/objectsIdToListen every times the effect is called because the dependencies to watch can be differents
    this.paths = new Set();
    this.objectsIdToListen = new Set();
    if (typeof this.effectFn === 'function') queueJob(this.effectFn.bind(this));
  }
}
