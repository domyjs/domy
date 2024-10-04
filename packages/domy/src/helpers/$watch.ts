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
  return (listener: OnSetListener['fn'], effect: () => any) => {
    const unwatch = domy.watch(
      {
        type: 'onSet',
        fn: listener
      },
      effect
    );

    return unwatch;
  };
}
