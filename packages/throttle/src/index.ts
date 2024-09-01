import { DOMY } from '@domyjs/types';

declare const DOMY: DOMY;

/**
 * Throttle utility implementation
 * @param domy
 * @returns
 *
 * @author yoannchb-pro
 */
export function throttlePlugin() {
  return function (fn: Function, limit: number) {
    let inThrottle = false;
    return function (this: any, ...args: any[]) {
      if (!inThrottle) {
        fn.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  };
}

DOMY.plugin(domyPluginSetter => {
  domyPluginSetter.helper('throttle', throttlePlugin);
});
