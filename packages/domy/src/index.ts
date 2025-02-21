import { createApp } from './core/createApp';
import { createComponent } from './core/createComponent';
import { matchPath, reactive, signal, skipReactive, watchEffect } from '@domyjs/reactive';
import { globalWatchHook, onMounted, onSetuped, onUnmount, watchHook } from './core/hooks';

const DOMY = {
  matchPath,
  reactive,
  signal,
  watchEffect,
  skipReactive,

  watch: watchHook,
  globalWatch: globalWatchHook,

  onSetuped,
  onMounted,
  onUnmount,

  createApp,
  createComponent
} as const;

export default DOMY;
