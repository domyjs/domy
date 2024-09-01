import { globalWatch as initialGlobalWatch } from '@domyjs/reactive';
import { OnSetListener } from '@domyjs/reactive/src/core/ReactiveVariable';

/**
 * Add a watcher to every reactive variables (even the one from d-data)
 * @param callback
 * @param objsToWatch
 * @returns
 */
export function globalWatch(callback: OnSetListener['fn']) {
  return initialGlobalWatch({
    type: 'onSet',
    fn: callback
  });
}
