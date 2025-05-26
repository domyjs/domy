import { createCallbackRegistrer } from '../utils/createCallbackRegistrer';
import { createHelperToHookRegistrer } from './createHelperToHookRegistrer';
import { $attrs } from '../helpers/$attrs';
import { $props } from '../helpers/$props';
import { $childrens } from '../helpers/$childrens';
import { $config } from '../helpers/$config';
import { $names } from '../helpers/$names';
import { $refs } from '../helpers/$refs';
import { $nextTick } from '../helpers/$nextTick';
import { globalWatch, watch } from '@domyjs/reactive';
import { OnSetListener } from 'packages/reactive/src/core/ReactiveVariable';
import { getUniqueQueueId, queueJob } from './scheduler';
import { queuedWatchEffect } from '../utils/queuedWatchEffect';

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
  useAttrs: helperToHookRegistrer.getHook($attrs),
  useProps: helperToHookRegistrer.getHook($props),
  useChildrens: helperToHookRegistrer.getHook($childrens),
  useConfig: helperToHookRegistrer.getHook($config),
  useNames: helperToHookRegistrer.getHook($names),
  useRefs: helperToHookRegistrer.getHook($refs),

  // Utilities
  nextTick: $nextTick(),
  watch: (listener: OnSetListener['fn'], effect: () => any) => {
    const queueId = getUniqueQueueId();
    return watch(
      {
        type: 'onSet',
        fn: props => queueJob(() => listener(props), queueId)
      },
      effect
    );
  },
  watchEffect: (effect: () => any) => {
    const uneffect = queuedWatchEffect(effect);
    return uneffect;
  },
  globalWatch: (listener: OnSetListener['fn']) => {
    const queueId = getUniqueQueueId();
    return globalWatch({
      type: 'onSet',
      fn: props => queueJob(() => listener(props), queueId)
    });
  }
};
