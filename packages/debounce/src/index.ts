import type DOMY from '@domyjs/core';

/**
 * Debounce utility implementation
 * @param domy
 * @returns
 *
 * @author yoannchb-pro
 */
export function debouncePlugin() {
  return function <T extends (...args: any[]) => void>(fn: T, delay: number) {
    let timeoutId: NodeJS.Timeout;
    return function (this: any, ...args: any[]) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        fn.apply(this, args);
      }, delay);
    };
  };
}

document.addEventListener('domy:ready', event => {
  const { detail: DOMYOBJ } = event as CustomEvent<typeof DOMY>;
  DOMYOBJ.plugin(domyPluginSetter => {
    domyPluginSetter.helper('debouncePlugin', debouncePlugin);
  });
});
