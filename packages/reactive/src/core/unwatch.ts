import { reactivesVariablesList } from './data';
import { Listener } from './ReactiveVariable';

/**
 * Remove a listener from some reactives variables
 * @param fn
 * @param objsToWatch
 *
 * @author yoannchb-pro
 */
export function unwatch(listener: Listener, objsToUnwatch: unknown[]) {
  const variablesToUnwatch = objsToUnwatch.map(obj => reactivesVariablesList.get(obj));

  for (const reactiveVariable of variablesToUnwatch) {
    reactiveVariable?.removeListener(listener);
  }
}
