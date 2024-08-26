import { State } from './State';
import * as ReactiveUtils from '../core/reactive';
import { getContext } from '../utils/getContext';
import { queueJob } from '../core/scheduler';
import { Config } from './Config';
import { createConfigurableDeepRender } from '../core/deepRender';

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
  modifiers: string[];
  attrName: string;
  attr: { name: string; value: string };

  queueJob: typeof queueJob;
  effect: (cb: () => void | Promise<void>) => void;
  cleanup: (cb: () => void | Promise<void>) => void;
  evaluate: (code: string) => any;
  evaluateWithoutListening: (code: string) => any;
  deepRender: ReturnType<typeof createConfigurableDeepRender>;
  addScopeToNode(obj: Record<string, any>): void;
  removeScopeToNode(obj: Record<string, any>): void;
  getContext: typeof getContext;
} & typeof ReactiveUtils;

export type DomyPluginDefinition = {
  prefix(name: string, fn: DomyDirectiveFn): void;
  directive(name: string, fn: DomyDirectiveFn): void;
  helper(name: string, fn: DomySpecialFn): void;
  prioritise(directives: string[]): void;
};

export type DomyPlugin = (domy: DomyPluginDefinition) => void;
