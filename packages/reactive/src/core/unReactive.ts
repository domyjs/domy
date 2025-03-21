import { reactivesVariablesList } from './data';
import { ReactiveVariable } from './ReactiveVariable';

/**
 * Will delete the reactivity of a data
 * @param obj
 * @returns
 *
 * @author yoannchb-pro
 */
export function unReactive<T = any>(obj: T): T {
  if (!ReactiveVariable.isReactive(obj)) return obj;

  const reactiveInstance = reactivesVariablesList.get(obj);

  if (!reactiveInstance) return obj;

  reactiveInstance.clearListeners();
  reactivesVariablesList.delete(obj);

  return reactiveInstance.getInitialObj();
}
