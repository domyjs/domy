import { watch as initialWatch, OnSetListener } from '../core/reactive';

/**
 * Add a watcher to some reactives variables
 * @param callback
 * @param objsToWatch
 * @returns
 */
export function watch(callback: OnSetListener['fn'], objsToWatch: unknown[]) {
  return initialWatch(
    {
      type: 'onSet',
      fn: callback
    },
    objsToWatch
  );
}
