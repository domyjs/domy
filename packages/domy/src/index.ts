import { createApp } from './core/createApp';
import { createComponent } from './core/createComponent';
import { matchPath, reactive, signal, skipReactive } from '@domyjs/reactive';
import { allHooks } from './core/hooks';

const DOMY = {
  matchPath,
  reactive,
  signal,
  skipReactive,

  ...allHooks,

  createApp,
  createComponent
} as const;

export default DOMY;
