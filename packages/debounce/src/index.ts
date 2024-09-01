import { DOMY } from '@domyjs/types';

declare const DOMY: DOMY;

/**
 * Debounce utility implementation
 * @param domy
 * @returns
 *
 * @author yoannchb-pro
 */
export function debouncePlugin() {
  return function (fn: (...args: any[]) => void, delay: number) {
    let timeoutId: NodeJS.Timeout;
    return function (this: any, ...args: any[]) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        fn.apply(this, args);
      }, delay);
    };
  };
}

DOMY.plugin(domyPluginSetter => {
  domyPluginSetter.helper('debouncePlugin', debouncePlugin);
});
