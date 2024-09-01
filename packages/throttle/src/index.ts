import type DOMY from '@domyjs/core';

/**
 * Throttle utility implementation
 * @param domy
 * @returns
 *
 * @author yoannchb-pro
 */
export function throttlePlugin() {
  return function <T extends (...args: any[]) => void>(fn: T, limit: number) {
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

document.addEventListener('domy:ready', event => {
  const { detail: DOMYOBJ } = event as CustomEvent<typeof DOMY>;
  DOMYOBJ.plugin(domyPluginSetter => {
    domyPluginSetter.helper('throttle', throttlePlugin);
  });
});
