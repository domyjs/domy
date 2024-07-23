import { deepRender } from '../core/deepRender';
import { State } from './State';
import { reactive } from '../core/reactive';
import { getContext } from '../utils/getContext';
import { queueJob } from '../core/scheduler';
import { Config } from './Config';

export type DomyDirectiveFn = (domy: DomyDirectiveHelper) => DomyDirectiveReturn;
export type DomySpecialFn = (domy: DomySpecialHelper) => any;

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
  getConfig: () => Config;
  state: State;
  scopedNodeData: Record<string, any>[];
  prefix: string;
  directive: string;
  modifiers: string[];
  attrName: string;
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

export type DomyPluginDefinition = {
  prefix(name: string, fn: DomyDirectiveFn): void;
  directive(name: string, fn: DomyDirectiveFn): void;
  helper(name: string, fn: DomySpecialFn): void;
  prioritise(directives: string[]): void;
};

export type DomyPlugin = (domy: DomyPluginDefinition) => void;
