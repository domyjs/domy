import { createCallbackRegistrer } from '../utils/createCallbackRegistrer';

export const onSetupedTracker = createCallbackRegistrer();
export const onMountedTracker = createCallbackRegistrer();
export const onUnmountTracker = createCallbackRegistrer();

export const onSetuped = onSetupedTracker.fn;
export const onMounted = onMountedTracker.fn;
export const onUnmount = onUnmountTracker.fn;
