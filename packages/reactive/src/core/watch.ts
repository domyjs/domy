import { reactivesVariablesList } from './data';
import { Listener } from './ReactiveVariable';

/**
 * Attach a listener to some reactives variables
 * @param fn
 * @param objsToWatch
 *
 * @author yoannchb-pro
 */
export function watch(listener: Listener, objsToWatch: unknown[]) {
  const variablesToWatch = objsToWatch
    .map(obj => reactivesVariablesList.get(obj))
    .filter(obj => !!obj);

  for (const reactiveVariable of variablesToWatch) {
    reactiveVariable.attachListener(listener);
  }
}
