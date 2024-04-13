import { deepRender } from '../core/deepRender';
import { State } from './State';
import { reactive } from '../core/reactive';
import { getContext } from '../utils/getContext';
import { queueJob } from '../core/scheduler';

export type DomyDirectiveReturn = {
  skipChildsRendering?: boolean;
  skipOtherAttributesRendering?: boolean;
} | void;

export type DomySpecialHelper = {
  el: Element | Text | undefined;
  state: State;
  scopedNodeData: Record<string, any>[];
};

export type DomyDirectiveHelper = {
  el: Element;
  state: State;
  scopedNodeData: Record<string, any>[];
  directive: string;
  modifiers: string[];
  attr: { name: string; value: string };
  queueJob: typeof queueJob;
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

export type DomyDirectiveFn = (domy: DomyDirectiveHelper) => DomyDirectiveReturn;
export type DomySpecialFn = (domy: DomySpecialHelper) => any;

export type DomyPluginDefinition = {
  registerDirective(name: string, fn: DomyDirectiveFn): void;
  registerSpecial(name: string, fn: DomySpecialFn): void;

  // registerVariant(name: string, fn: DomyFn): void;
  // registerWatcher(path: string, fn: DomyFn): void;
};

export type DomyPlugin = (domy: DomyPluginDefinition) => void;
