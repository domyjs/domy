import { globalWatch } from './api/globalWatch';
import { watch } from './api/watch';
import { createApp } from './core/createApp';
import { plugin } from './core/plugin';
import { matchPath, reactive, ref } from './core/reactive';

const DOMY = {
  ref,
  reactive,
  watch,
  matchPath,
  globalWatch,

  createApp,
  plugin
} as const;

export default DOMY;
