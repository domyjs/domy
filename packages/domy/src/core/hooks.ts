import { globalWatch, watch } from '@domyjs/reactive';
import { createCallbackRegistrer } from '../utils/createCallbackRegistrer';

export const onSetupedTracker = createCallbackRegistrer();
export const onMountedTracker = createCallbackRegistrer();
export const onUnmountTracker = createCallbackRegistrer();

export const onSetuped = onSetupedTracker.fn;
export const onMounted = onMountedTracker.fn;
export const onUnmount = onUnmountTracker.fn;

export const watchHook = function (listener: () => void, effect: () => void) {
  return watch({ type: 'onSet', fn: listener }, effect);
};
export const globalWatchHook = function (listener: () => void) {
  return globalWatch({ type: 'onSet', fn: listener });
};
