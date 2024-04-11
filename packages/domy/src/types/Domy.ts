import { evaluate } from '../utils/evaluate';
import { deepRender } from '../core/deepRender';
import { State } from './State';
import { reactive } from '../core/reactive';
import { getContext } from '../utils/getContext';

export type DomyPluginHelper = {
  el: Element;
  state: State;
  scopedNodeData: Record<string, any>[];
  directive: string;
  modifiers: string[];
  attr: { name: string; value: string };
  effect: (cb: () => void | Promise<void>) => void;
  cleanup: (cb: () => void | Promise<void>) => void;
  reactive: typeof reactive;
  evaluate: (code: string) => any;
  evaluateWithoutListening: (code: string) => any;
  deepRender: typeof deepRender;
  addScopeToNode(obj: Record<string, any>): void;
  removeScopeToNode(obj: Record<string, any>): void;
  getContext: typeof getContext;
};

export type DomyFn = (domy: DomyPluginHelper) => void | Promise<void>;

export type DomyPluginDefinition = {
  registerAttribute(name: string, fn: DomyFn): void;
  registerSpecial(name: string, fn: DomyFn): void;
  registerVariant(name: string, fn: DomyFn): void;
  registerWatcher(path: string, fn: DomyFn): void;
};

export type DomyPlugin = (domy: DomyPluginDefinition) => void;
