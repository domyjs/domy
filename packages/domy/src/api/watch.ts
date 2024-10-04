import { watch as initialWatch } from '@domyjs/reactive';
import { OnSetListener } from '@domyjs/reactive/src/core/ReactiveVariable';

/**
 * Add a watcher to some reactives variables
 * @param callback
 * @param objsToWatch
 * @returns
 */
export function watch(callback: OnSetListener['fn'], effect: () => any) {
  return initialWatch(
    {
      type: 'onSet',
      fn: callback
    },
    effect
  );
}
