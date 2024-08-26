import { deepRender } from '../core/deepRender';
import { State } from './State';
import {
  reactive,
  watch,
  unwatch,
  globalWatch,
  removeGlobalWatch,
  matchPath,
  ref
} from '../core/reactive';
import { getContext } from '../utils/getContext';
import { queueJob } from '../core/scheduler';
import { Config } from './Config';

type WatchingUtils = {
  ref: typeof ref;
  reactive: typeof reactive;
  watch: typeof watch;
  unwatch: typeof unwatch;
  globalWatch: typeof globalWatch;
  removeGlobalWatch: typeof removeGlobalWatch;
  matchPath: typeof matchPath;
};

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
} & WatchingUtils;

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
  evaluate: (code: string) => any;
  evaluateWithoutListening: (code: string) => any;
  deepRender: typeof deepRender;
  addScopeToNode(obj: Record<string, any>): void;
  removeScopeToNode(obj: Record<string, any>): void;
  getContext: typeof getContext;
} & WatchingUtils;

export type DomyPluginDefinition = {
  prefix(name: string, fn: DomyDirectiveFn): void;
  directive(name: string, fn: DomyDirectiveFn): void;
  helper(name: string, fn: DomySpecialFn): void;
  prioritise(directives: string[]): void;
};

export type DomyPlugin = (domy: DomyPluginDefinition) => void;
