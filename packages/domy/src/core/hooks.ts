import { createCallbackRegistrer } from '../utils/createCallbackRegistrer';
import { createHelperToHookRegistrer } from './createHelperToHookRegistrer';
import { $el } from '../helpers/$el';
import { $attrs } from '../helpers/$attrs';
import { $props } from '../helpers/$props';
import { $childrens } from '../helpers/$childrens';
import { $config } from '../helpers/$config';
import { $names } from '../helpers/$names';
import { $root } from '../helpers/$root';
import { $refs } from '../helpers/$refs';
import { $watch } from '../helpers/$watch';
import { $watchEffect } from '../helpers/$watchEffect';
import { $globalWatch } from '../helpers/$globalWatch';
import { $nextTick } from '../helpers/$nextTick';

export const helperToHookRegistrer = createHelperToHookRegistrer();

export const onSetupedTracker = createCallbackRegistrer();
export const onMountedTracker = createCallbackRegistrer();
export const onBeforeUnmountTracker = createCallbackRegistrer();
export const onUnmountedTracker = createCallbackRegistrer();

export const allHooks = {
  // Lifecycle
  onSetuped: onSetupedTracker.fn,
  onMounted: onMountedTracker.fn,
  onBeforeUnmount: onBeforeUnmountTracker.fn,
  onUnmounted: onUnmountedTracker.fn,

  // Helpers hooks
  useEl: helperToHookRegistrer.getHook($el),
  useRoot: helperToHookRegistrer.getHook($root),
  useAttrs: helperToHookRegistrer.getHook($attrs),
  useProps: helperToHookRegistrer.getHook($props),
  useChildrens: helperToHookRegistrer.getHook($childrens),
  useConfig: helperToHookRegistrer.getHook($config),
  useNames: helperToHookRegistrer.getHook($names),
  useRefs: helperToHookRegistrer.getHook($refs),

  // Utilities
  watch: $watch(),
  watchEffect: $watchEffect(),
  globalWatch: $globalWatch(),
  nextTick: $nextTick()
};
