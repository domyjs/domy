import type DOMY from '@domyjs/core';
import type { DomySpecialHelper } from '@domyjs/core/src/types/Domy';

const debounceCache = new Map<number, (...args: any[]) => void>();

/**
 * Debounce utility implementation
 * @param domy
 * @returns
 *
 * @author yoannchb-pro
 */
export function debouncePlugin(domy: DomySpecialHelper) {
  const hasId = typeof domy.domyHelperId === 'number';

  return function <T extends (...args: any[]) => void>(fn: T, delay: number) {
    if (hasId) {
      const cachedDebounceFn = debounceCache.get(domy.domyHelperId as number);
      if (cachedDebounceFn) return cachedDebounceFn;
    }

    let timeoutId: NodeJS.Timeout;

    const debounceFn = function (this: any, ...args: any[]) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        fn.apply(this, args);
      }, delay);
    };

    if (hasId) debounceCache.set(domy.domyHelperId as number, debounceFn);

    return debounceFn;
  };
}

document.addEventListener('domy:ready', event => {
  const { detail: DOMYOBJ } = event as CustomEvent<typeof DOMY>;
  DOMYOBJ.plugin(domyPluginSetter => {
    domyPluginSetter.helper('debounce', debouncePlugin);
  });
});
