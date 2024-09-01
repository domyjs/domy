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
  return reactive({ value: obj, [isSignalSymbol]: true });
}
