import type { State } from './State';
import type * as ReactiveUtils from '@domyjs/reactive';
import { Config } from './Config';
import { getContext } from '../utils/getContext';
import { getUniqueQueueId, queueJob } from '../core/scheduler';
import { helpersUtils } from '../utils/helpersUtils';
import { directivesUtils } from '../utils/directivesUtils';
import { createDeepRenderFn } from '../core/deepRender';
import type { Block } from '../core/Block';
import type { PluginHelper } from '../core/plugin';
import { AppStateObserver } from '../core/AppState';

export type DomyDirectiveFn = (domy: DomyDirectiveHelper) => DomyDirectiveReturn;
export type DomySpecialFn = (domy: DomySpecialHelper) => any;

export type DomyDirectiveReturn = {
  skipChildsRendering?: boolean;
  skipOtherAttributesRendering?: boolean;
  skipComponentRendering?: boolean;
} | void;

export type DomySpecialHelper = {
  domyHelperId?: number;
  el?: Element | Text;
  state: State;
  scopedNodeData: Record<string, any>[];
  config: Config;
  utils: typeof helpersUtils;
} & typeof ReactiveUtils;

export type DomyDirectiveHelper = {
  domyHelperId: number;
  pluginHelper: PluginHelper;
  appState: AppStateObserver;
  block: Block;
  config: Config;
  state: State;
  scopedNodeData: Record<string, any>[];
  prefix: string;
  directive: string;
  modifiers: string[];
  attrName: string;
  attr: { name: string; value: string };

  utils: typeof directivesUtils;

  onElementMounted(cb: () => void): void;
  onAppMounted(cb: () => void): void;
  getUniqueQueueId: typeof getUniqueQueueId;
  queueJob: typeof queueJob;
  effect(cb: () => void): (() => void) | void;
  cleanup(cb: () => void): void;
  evaluate(code: string, scope?: Record<string, any>): any;
  deepRender: ReturnType<typeof createDeepRenderFn>;
  addScopeToNode(obj: Record<string, any>): void;
  removeScopeToNode(obj: Record<string, any>): void;
  getContext: typeof getContext;
} & typeof ReactiveUtils;

export type DomyPluginDefinition = {
  prefix(name: string, fn: DomyDirectiveFn): void;
  directive(name: string, fn: DomyDirectiveFn): void;
  helper(name: string, fn: DomySpecialFn): void;
};

export type DomyPlugin = (domy: DomyPluginDefinition) => void;

export type DOMY = {
  plugin: (domyPluginDefinition: DomyPlugin) => void;
};
