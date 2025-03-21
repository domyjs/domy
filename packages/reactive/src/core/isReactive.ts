import { ReactiveVariable } from './ReactiveVariable';

/**
 * Will return true if a obj is a signal/reactive
 * @param obj
 * @returns
 *
 * @author yoannchb-pro
 */
export function isReactive(obj: any) {
  return ReactiveVariable.isReactive(obj);
}
