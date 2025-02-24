import { watch } from '@domyjs/reactive';
import { getUniqueQueueId, queueJob } from '../core/scheduler';
import { OnSetListener } from '@domyjs/reactive/src/core/ReactiveVariable';

/**
 * Allow to register a watcher on a data
 * @param domy
 * @returns
 *
 * @author yoannchb-pro
 */
export function $watch() {
  const queueId = getUniqueQueueId();

  return (listener: OnSetListener['fn'], effect: () => any) => {
    const unwatch = watch(
      {
        type: 'onSet',
        fn: props => queueJob(() => listener(props), queueId)
      },
      effect
    );

    return unwatch;
  };
}
