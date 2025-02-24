import { globalWatch } from '@domyjs/reactive';
import { getUniqueQueueId, queueJob } from '../core/scheduler';
import { OnSetListener } from '@domyjs/reactive/src/core/ReactiveVariable';

/**
 * Allow to register a global watcher
 * @param domy
 * @returns
 *
 * @author yoannchb-pro
 */
export function $globalWatch() {
  const queueId = getUniqueQueueId();

  return (listener: OnSetListener['fn']) => {
    const unwatch = globalWatch({
      type: 'onSet',
      fn: props => queueJob(() => listener(props), queueId)
    });

    return unwatch;
  };
}
