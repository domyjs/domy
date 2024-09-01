import type DOMY from '@domyjs/core';
import type { DomySpecialHelper } from '@domyjs/core/src/types/Domy';

const temp = new Map<Element, (...args: any[]) => void>();

/**
 * Throttle utility implementation
 * @param domy
 * @returns
 *
 * @author yoannchb-pro
 */
export function throttlePlugin(domy: DomySpecialHelper) {
  if (domy.el) {
    const tempFn = temp.get(domy.el as Element);
    if (tempFn) return tempFn;
  }

  const fn = function <T extends (...args: any[]) => void>(fn: T, limit: number) {
    let inThrottle = false;
    return function (this: any, ...args: any[]) {
      if (!inThrottle) {
        fn.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  };

  if (domy.el) temp.set(domy.el as Element, fn);

  return fn;
}

document.addEventListener('domy:ready', event => {
  const { detail: DOMYOBJ } = event as CustomEvent<typeof DOMY>;
  DOMYOBJ.plugin(domyPluginSetter => {
    domyPluginSetter.helper('throttle', throttlePlugin);
  });
});
