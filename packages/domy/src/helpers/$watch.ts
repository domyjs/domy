import { getUniqueQueueId, queueJob } from '../core/scheduler';
import { DomySpecialHelper } from '../types/Domy';
import { OnSetListener } from '@domyjs/reactive/src/core/ReactiveVariable';

/**
 * Allow to register a watcher on a data
 * @param domy
 * @returns
 *
 * @author yoannchb-pro
 */
export function $watch(domy: DomySpecialHelper) {
  const queueId = getUniqueQueueId();

  return (listener: OnSetListener['fn'], effect: () => any) => {
    const unwatch = domy.watch(
      {
        type: 'onSet',
        fn: props => queueJob(() => listener(props), queueId)
      },
      effect
    );

    return unwatch;
  };
}
