import type DOMY from '@domyjs/core/src';
import type { DomySpecialHelper } from '@domyjs/core/src/types/Domy';

const throttleCache = new Map<number, (...args: any[]) => void>();

/**
 * Throttle utility implementation
 * @param domy
 * @returns
 *
 * @author yoannchb-pro
 */
export function throttlePlugin(domy: DomySpecialHelper) {
  const hasId = typeof domy.domyHelperId === 'number';

  return function <T extends (...args: any[]) => void>(fn: T, limit: number) {
    if (hasId) {
      const cachedThrottleFn = throttleCache.get(domy.domyHelperId as number);
      if (cachedThrottleFn) return cachedThrottleFn;
    }

    let inThrottle = false;

    const throttleFn = function (this: any, ...args: any[]) {
      if (!inThrottle) {
        fn.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };

    if (hasId) throttleCache.set(domy.domyHelperId as number, throttleFn);

    return throttleFn;
  };
}

document.addEventListener('domy:ready', event => {
  const { detail: DOMYOBJ } = event as CustomEvent<typeof DOMY>;
  DOMYOBJ.plugin(domyPluginSetter => {
    domyPluginSetter.helper('throttle', throttlePlugin);
  });
});
