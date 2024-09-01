import { State } from './State';
import * as ReactiveUtils from '@domyjs/reactive';
import { Config } from './Config';
import { DeepRenderFn } from './DeepRenderFn';

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
} & typeof ReactiveUtils;

export type DomyDirectiveHelper = {
  el: Element;
  config: Config;
  state: State;
  scopedNodeData: Record<string, any>[];
  prefix: string;
  directive: string;
  modifiers: Set<string>;
  attrName: string;
  attr: { name: string; value: string };

  queueJob: (fn: () => void | Promise<void>) => void;
  effect: (cb: () => void | Promise<void>) => void;
  cleanup: (cb: () => void | Promise<void>) => void;
  evaluate: (code: string) => any;
  evaluateWithoutListening: (code: string) => any;
  deepRender: DeepRenderFn;
  addScopeToNode(obj: Record<string, any>): void;
  removeScopeToNode(obj: Record<string, any>): void;
  getContext: (
    el: Element | Text | undefined,
    state: State,
    scopedNodeData: Record<string, any>[]
  ) => any;
} & typeof ReactiveUtils;

export type DomyPluginDefinition = {
  prefix(name: string, fn: DomyDirectiveFn): void;
  directive(name: string, fn: DomyDirectiveFn): void;
  helper(name: string, fn: DomySpecialFn): void;
  prioritise(directives: string[]): void;
};

export type DomyPlugin = (domy: DomyPluginDefinition) => void;
