import { DomyPluginHelper } from '../types/Domy';
import { State } from '../types/State';
import { evaluate } from '../utils/evaluate';
import { getContext } from '../utils/getContext';
import { deepRender } from './deepRender';
import { reactive } from './reactive';
import { render } from './render';

export class DomyHelper {
  private dataToInject: Record<string, any>[] = [];

  private cleanupFn: (() => Promise<void> | void) | null = null;
  private effectFn: (() => Promise<void> | void) | null = null;
  public directive: string = '';
  public attr: { name: string; value: string } = { name: '', value: '' };
  public variants: string[] = [];

  constructor(
    public el: Element,
    public state: State
  ) {}

  getPluginHelper(): DomyPluginHelper {
    return {
      el: this.el,
      state: this.state,
      directive: this.directive,
      variants: this.variants,
      attr: this.attr,
      effect: this.effect.bind(this),
      cleanup: this.cleanup.bind(this),
      reactive,
      evaluate: this.evaluate.bind(this),
      deepRender: deepRender,
      render: render,
      addScopeToNode: this.addScopeToNode.bind(this),
      getContext
    };
  }

  effect(cb: () => void | Promise<void>) {
    this.effectFn = cb;
  }

  cleanup(cb: () => void | Promise<void>) {
    this.cleanupFn = cb;
  }

  evaluate(code: string) {
    return evaluate({
      code: code,
      context: getContext(this.el, this.state, this.dataToInject),
      returnResult: true,
      contextAsGlobal: true
    });
  }

  addScopeToNode(obj: Record<string, any>) {
    this.dataToInject.push(obj);
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
