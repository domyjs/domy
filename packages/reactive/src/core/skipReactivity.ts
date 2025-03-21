import { skipReactivitySymbol } from './ReactiveVariable';

/**
 * Skip the reactivity on an element we don't wanna listen to in a reactivity variable
 * Example:
 * const myElement = reactive({ el: skipReactive({ ... }), name: 'div' })
 * @param obj
 * @returns
 *
 * @author yoannchb-pro
 */
export function skipReactive<T = any>(obj: T): T {
  Object.defineProperty(obj, skipReactivitySymbol, {
    enumerable: false,
    writable: false,
    value: true,
    configurable: true
  });
  return obj;
}
