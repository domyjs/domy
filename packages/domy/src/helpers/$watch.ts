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
  return (listener: OnSetListener['fn'], getListenedObjs: () => any) => {
    const objs: any[] = [];

    const removeGlobalWatcher = domy.globalWatch({
      type: 'onGet',
      fn: ({ proxy }) => {
        objs.push(proxy);
      }
    });
    getListenedObjs();
    removeGlobalWatcher();

    const unwatch = domy.watch(
      {
        type: 'onSet',
        fn: listener
      },
      objs
    );

    domy.cleanup(unwatch);

    return unwatch;
  };
}
