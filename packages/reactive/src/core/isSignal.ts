import { ReactiveVariable } from './ReactiveVariable';

/**
 * Will return true if the obj is a signal
 * @param obj
 * @returns
 *
 * @author yoannchb-pro
 */
export function isSignal(obj: any) {
  return ReactiveVariable.isReactive(obj);
}
