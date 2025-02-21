import { createApp } from './core/createApp';
import { createComponent } from './core/createComponent';
import {
  globalWatch,
  matchPath,
  reactive,
  signal,
  skipReactive,
  watch,
  watchEffect
} from '@domyjs/reactive';
import { onMounted, onSetuped, onUnmount } from './core/hooks';

const DOMY = {
  matchPath,
  reactive,
  signal,
  globalWatch,
  watch,
  watchEffect,
  skipReactive,

  onSetuped,
  onMounted,
  onUnmount,

  createApp,
  createComponent
} as const;

export default DOMY;
