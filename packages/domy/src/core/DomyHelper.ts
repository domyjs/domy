import { configuration } from '../config';
import { DomyDirectiveHelper } from '../types/Domy';
import { State } from '../types/State';
import { evaluate } from '../utils/evaluate';
import { getContext } from '../utils/getContext';
import { deepRender } from './deepRender';
import {
  globalWatch,
  Listener,
  matchPath,
  OnSetListener,
  reactive,
  removeGlobalWatch,
  unwatch,
  watch
} from './reactive';
import { queueJob } from './scheduler';

/**
 * Domy helper class that handle dependencie change and give everything we need
 *
 * @author yoannchb-pro
 */
export class DomyHelper {
  private onSetListener: OnSetListener | null = null;

  private cleanupFn: (() => Promise<void> | void) | null = null;
  private effectFn: (() => Promise<void> | void) | null = null;

  public prefix: string = '';
  public directive: string = '';
  public attrName: string = ''; // The attribute name without the modifiers and prefix
  public attr: { name: string; value: string } = { name: '', value: '' };
  public modifiers: string[] = [];

  private paths = new Set<string>();
  private resetPaths = true;

  private static evaluator = evaluate;

  constructor(
    private deepRenderFn: typeof deepRender, // It allow us to avoid circular dependencie (deepRender -> DomyHelper -> deepRender)
    public el: Element,
    public state: State,
    public scopedNodeData: Record<string, any>[] = []
  ) {}

  getPluginHelper(renderWithoutListeningToChange = false): DomyDirectiveHelper {
    const evaluateWithoutListening = this.evaluateWithoutListening.bind(this);

    return {
      el: this.el,
      state: this.state,
      scopedNodeData: this.scopedNodeData,

      prefix: this.prefix,
      directive: this.directive,
      modifiers: this.modifiers,

      attrName: this.attrName,
      attr: this.attr,

      reactive,
      watch,
      unwatch,
      globalWatch,
      removeGlobalWatch,
      matchPath,

      getConfig: configuration.getConfig,
      queueJob,
      effect: this.effect.bind(this),
      cleanup: this.cleanup.bind(this),
      evaluate: renderWithoutListeningToChange
        ? evaluateWithoutListening
        : this.evaluate.bind(this),
      startMultipleEvaluate: this.startMultipleEvaluate.bind(this),
      stopMultipleEvaluate: this.stopMultipleEvalueate.bind(this),
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
      fn: ({ path }) => {
        for (const listenedPath of this.paths) {
          if (matchPath(listenedPath, path).isMatching) {
            this.callCleanup();
            this.callEffect();
          }
        }
      }
    };

    globalWatch(this.onSetListener);
  }

  effect(cb: () => void | Promise<void>) {
    this.effectFn = cb;
  }

  cleanup(cb: () => void | Promise<void>) {
    this.cleanupFn = cb;
  }

  eval(code: string) {
    const executedValued = DomyHelper.evaluator({
      code: code,
      contextAsGlobal: !configuration.getConfig().avoidDeprecatedWith,
      context: getContext(this.el, this.state, this.scopedNodeData),
      returnResult: true
    });
    return executedValued;
  }

  /**
   * If we need to do many evaluate we don't want to reset paths on every evaluate
   * This is why startMultipleEvaluate and stopMultipleEvaluate exists
   */
  startMultipleEvaluate() {
    this.resetPaths = false;
  }

  stopMultipleEvalueate() {
    this.resetPaths = true;
  }

  evaluate(code: string) {
    if (this.resetPaths) this.paths = new Set<string>();

    const listener: Listener = {
      type: 'onGet',
      fn: ({ path }) => {
        this.attachOnSetListener();
        this.paths.add(path);
      }
    };

    globalWatch(listener);

    let executedValue;
    let errorMsg;
    try {
      executedValue = this.eval(code);
    } catch (err: any) {
      errorMsg = err;
    }

    removeGlobalWatch(listener);

    if (errorMsg) throw errorMsg; // We want to throw the error later to ensure we removed the global watcher

    return executedValue;
  }

  evaluateWithoutListening(code: string) {
    return this.eval(code);
  }

  static setEvaluator(evaluator: typeof DomyHelper.evaluator) {
    DomyHelper.evaluator = evaluator;
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
    if (typeof this.effectFn === 'function') queueJob(this.effectFn.bind(this));
  }
}
