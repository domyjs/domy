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

  const reactiveInstance = reactivesVariablesList.get(obj) as ReactiveVariable;

  reactiveInstance.clearListeners();
  reactiveInstance.clearProxy();

  reactivesVariablesList.delete(obj);

  return reactiveInstance.getInitialObj();
}
