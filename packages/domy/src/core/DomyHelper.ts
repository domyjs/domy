import { cspEvaluate } from '../utils/cspEvaluate';
import { evaluate } from '../utils/evaluate';
import { getContext } from '../utils/getContext';
import * as ReactiveUtils from '@domyjs/reactive';
import { queueJob } from './scheduler';
import { State } from '../types/State';
import { Config } from '../types/Config';
import { directivesUtils } from '../utils/directivesUtils';
import { DomyDirectiveHelper } from '../types/Domy';
import { createDeepRenderFn } from './deepRender';
import { getDomyAttributeInformations } from '../utils/domyAttrUtils';
import type { Block } from './Block';
import { DOMY_EVENTS } from './DomyEvents';
import { DomyMountedEventDetails } from '../types/Events';
import { error } from '../utils/logs';

let domyHelperId = 0;

/**
 * Domy helper class that handle dependencie change and give everything we need
 *
 * @author yoannchb-pro
 */
export class DomyHelper {
  private domyHelperId = ++domyHelperId;

  private unmount = false;

  private cleanupFn: (() => void) | null = null;
  private clearEffectList: (() => void)[] = [];

  public prefix: string = '';
  public directive: string = '';
  public attrName: string = ''; // The attribute name without the modifiers and prefix
  public attr: { name: string; value: string } = { name: '', value: '' };
  public modifiers: string[] = [];

  constructor(
    private appId: number,
    private deepRenderFn: ReturnType<typeof createDeepRenderFn>,
    public block: Block,
    public state: State,
    public scopedNodeData: Record<string, any>[] = [],
    public config: Config,
    public renderWithoutListeningToChange: boolean,
    public appState: { isAppMounted: boolean }
  ) {}

  getPluginHelper(): DomyDirectiveHelper {
    return {
      domyHelperId: this.domyHelperId,
      appState: this.appState,
      block: this.block,
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

      queueJob,
      onElementMounted: this.onElementMounted.bind(this),
      onAppMounted: this.onAppMounted.bind(this),
      effect: this.effect.bind(this),
      cleanup: this.cleanup.bind(this),
      evaluate: this.evaluate.bind(this),
      deepRender: this.deepRenderFn,
      addScopeToNode: this.addScopeToNode.bind(this),
      removeScopeToNode: this.removeScopeToNode.bind(this),
      getContext
    };
  }

  copy() {
    const copy = new DomyHelper(
      this.appId,
      this.deepRenderFn,
      this.block,
      this.state,
      [...this.scopedNodeData], // Ensure the scoped node data of the current node are not affected by the next operations (like removing the scoped data in d-for)
      this.config,
      this.renderWithoutListeningToChange,
      this.appState
    );
    return copy;
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

  onElementMounted(cb: () => void) {
    if (this.appState.isAppMounted) cb();
    else this.block.attachListener(DOMY_EVENTS.ElementMounted, cb, { once: true });
  }

  onAppMounted(cb: () => void) {
    const listener: EventListenerOrEventListenerObject = event => {
      const e = event as CustomEvent<DomyMountedEventDetails>;
      if (e.detail.appId === this.appId) {
        document.removeEventListener(DOMY_EVENTS.App.Mounted, listener);
        cb();
      }
    };
    document.addEventListener(DOMY_EVENTS.App.Mounted, listener);
  }

  clearEffects() {
    for (const clearEffect of this.clearEffectList) {
      clearEffect();
    }
    this.clearEffectList.length = 0;
  }

  effect(fn: () => void) {
    // Unsure to not make the effect if the app is unmounted
    const fixedFn = () => {
      if (!this.unmount) fn();
    };

    // If the app is not mounted yet we don't need to queue the job
    const start = (fn: () => void) =>
      this.appState.isAppMounted
        ? queueJob(fn)
        : directivesUtils.callWithErrorHandling(fn, err => error(err));

    if (!this.renderWithoutListeningToChange) {
      start(() => {
        const uneffect = ReactiveUtils.watchEffect(fixedFn, {
          // make sure the job is queue again and we listen for dep changes
          onDepChange: uneffect => {
            uneffect();

            const index = this.clearEffectList.indexOf(uneffect);
            if (index !== 1) this.clearEffectList.splice(index, 1);

            this.effect(fn);
          },
          noSelfUpdate: true
        });

        this.clearEffectList.push(uneffect);
      });
    } else {
      start(fixedFn);
    }
  }

  cleanup(cb: () => void) {
    this.cleanupFn = cb;
  }

  evaluate(code: string) {
    const evaluator = this.config.CSP ? cspEvaluate : evaluate;

    const context = getContext({
      domyHelperId: this.domyHelperId,
      el: this.block.el,
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

  addScopeToNode(obj: Record<string, any>) {
    this.scopedNodeData.push(obj);
  }

  removeScopeToNode(obj: Record<string, any>) {
    const index = this.scopedNodeData.findIndex(o => o === obj);
    if (index !== -1) this.scopedNodeData.splice(index, 1);
  }

  getCleanupFn() {
    return this.callCleanup.bind(this);
  }

  callCleanup() {
    // not queued to ensure it start before childs update
    this.unmount = true;
    this.clearEffects();
    if (typeof this.cleanupFn === 'function') this.cleanupFn();
    this.cleanupFn = null;
  }
}
