import { DomyPluginHelper } from '../types/Domy';
import { State } from '../types/State';
import { evaluate } from '../utils/evaluate';
import { getContext } from '../utils/getContext';
import { deepRender } from './deepRender';
import { Listener, OnSetListener, reactive } from './reactive';

export class DomyHelper {
  private onSetListener: OnSetListener | null = null;

  private cleanupFn: (() => Promise<void> | void) | null = null;
  private effectFn: (() => Promise<void> | void) | null = null;

  public directive: string = '';
  public attr: { name: string; value: string } = { name: '', value: '' };
  public variants: string[] = [];

  private paths = new Set<string>();

  constructor(
    public el: Element,
    public state: State,
    public scopedNodeData: Record<string, any>[] = []
  ) {}

  getPluginHelper(): DomyPluginHelper {
    return {
      el: this.el,
      state: this.state,
      scopedNodeData: this.scopedNodeData,
      directive: this.directive,
      variants: this.variants,
      attr: this.attr,
      effect: this.effect.bind(this),
      cleanup: this.cleanup.bind(this),
      reactive,
      evaluate: this.evaluate.bind(this),
      evaluateWithoutListening: this.evaluateWithoutListening.bind(this),
      deepRender: deepRender,
      addScopeToNode: this.addScopeToNode.bind(this),
      getContext
    };
  }

  attachOnSetListener() {
    if (this.onSetListener) return;
    this.onSetListener = {
      type: 'onSet',
      fn: ({ path, prevValue, newValue }) => {
        if (this.paths.has(path)) {
          this.callCleanup();
          this.callEffect();
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
        // console.log('get', path, this.el);
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

  createGlobal(name: string, defaultValue: any) {
    this.state.global[name] = defaultValue;
  }

  getGlobal(name: string) {
    return this.state.global[name];
  }

  callCleanup() {
    if (typeof this.cleanupFn === 'function') this.cleanupFn();
  }

  callEffect() {
    if (typeof this.effectFn === 'function') this.effectFn();
  }
}
