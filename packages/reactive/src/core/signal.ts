import { reactive } from './reactive';
import { isSignalSymbol } from './ReactiveVariable';

/**
 * Transform a primitive into a reactive object to listen to any change
 * @param obj
 * @returns
 *
 * @author yoannchb-pro
 */
export function signal<T>(obj: T): { value: T } {
  const sig = { value: obj };
  Object.defineProperty(sig, isSignalSymbol, {
    enumerable: false,
    writable: false,
    value: true,
    configurable: true
  });
  return reactive(sig);
}
