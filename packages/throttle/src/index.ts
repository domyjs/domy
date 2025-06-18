import type { DomyPlugin, DomySpecialHelper } from '@domyjs/core';

/**
 * Throttle utility implementation
 * @param domy
 * @returns
 *
 * @author yoannchb-pro
 */
function throttlePlugin() {
  const throttleCache = new Map<number, (...args: any[]) => void>();

  return function (domy: DomySpecialHelper) {
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
  };
}

const throttlePluginDefintion: DomyPlugin = domyPluginSetter => {
  domyPluginSetter.helper('throttle', throttlePlugin());
};

export default throttlePluginDefintion;
