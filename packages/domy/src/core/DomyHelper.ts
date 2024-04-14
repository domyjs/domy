import { DomyDirectiveHelper } from '../types/Domy';
import { State } from '../types/State';
import { evaluate } from '../utils/evaluate';
import { getContext } from '../utils/getContext';
import { deepRender } from './deepRender';
import { Listener, OnSetListener, reactive } from './reactive';
import { queueJob } from './scheduler';

export class DomyHelper {
  private onSetListener: OnSetListener | null = null;

  private cleanupFn: (() => Promise<void> | void) | null = null;
  private effectFn: (() => Promise<void> | void) | null = null;

  public directive: string = '';
  public attrName: string = '';
  public attr: { name: string; value: string } = { name: '', value: '' };
  public modifiers: string[] = [];

  private paths = new Set<string>();

  constructor(
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
      directive: this.directive,
      attrName: this.attrName,
      modifiers: this.modifiers,
      attr: this.attr,
      queueJob,
      effect: this.effect.bind(this),
      cleanup: this.cleanup.bind(this),
      reactive,
      evaluate: renderWithoutListeningToChange
        ? evaluateWithoutListening
        : this.evaluate.bind(this),
      evaluateWithoutListening,
      deepRender: deepRender,
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
          if (this.state.data.matchPath(listenedPath, path).isMatching) {
            this.callCleanup();
            this.callEffect();
          }
        }
      }
    };
    this.state.data.attachListener(this.onSetListener);
  }

  effect(cb: () => void | Promise<void>) {
    this.effectFn = cb;
  }

  cleanup(cb: () => void | Promise<void>) {
    this.cleanupFn = cb;
  }

  evaluate(code: string) {
    this.paths = new Set<string>();

    const listener: Listener = {
      type: 'onGet',
      fn: ({ path }) => {
        this.attachOnSetListener();
        this.paths.add(path);
      }
    };

    this.state.data.attachListener(listener);

    const executedValued = evaluate({
      code: code,
      contextAsGlobal: true,
      context: getContext(this.el, this.state, this.scopedNodeData),
      returnResult: true
    });

    this.state.data.removeListener(listener);

    return executedValued;
  }

  evaluateWithoutListening(code: string) {
    const executedValued = evaluate({
      code: code,
      contextAsGlobal: true,
      context: getContext(this.el, this.state, this.scopedNodeData),
      returnResult: true
    });
    return executedValued;
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
