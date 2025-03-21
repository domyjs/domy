import { isComputed, isSignal } from '@domyjs/reactive';

/**
 * Return the get and set method for a reactive variable
 * It allow us to keep the proxy and to handle signals
 * @param obj
 * @param key
 * @returns
 *
 * @author yoannchb-pro
 */
export function getReactiveHandler(obj: Record<string, any>, key: string): PropertyDescriptor {
  return {
    enumerable: true,
    configurable: true,
    get() {
      return isSignal(obj[key]) || isComputed(obj[key]) ? obj[key].value : obj[key];
    },
    set(newValue: any) {
      if (isSignal(obj[key]) || isComputed(obj[key])) return (obj[key].value = newValue);
      return (obj[key] = newValue);
    }
  };
}
