import { createApp } from './core/createApp';
import { createComponent } from './core/createComponent';
import * as ReactiveUtils from '@domyjs/reactive';
import { allHooks, helperToHookRegistrer } from './core/hooks';

const DOMY = {
  matchPath: ReactiveUtils.matchPath,
  signal: ReactiveUtils.signal,
  computed: ReactiveUtils.computed,
  skipReactive: ReactiveUtils.skipReactive,

  helperToHookRegistrer,
  ...allHooks,

  createApp,
  createComponent
};

export default DOMY;

export type * from './types/App';
export type * from './types/Component';
export type * from './types/Config';
export type * from './types/Domy';
export type * from './types/Helpers';
export type * from './types/State';
export type { Block } from './core/Block';
