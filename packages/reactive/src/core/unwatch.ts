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
  const variablesToUnwatch = reactivesVariablesList.filter(reactiveVariable =>
    objsToUnwatch.some(objToUnwatch => objToUnwatch === reactiveVariable.getProxy())
  );
  for (const reactiveVariable of variablesToUnwatch) {
    reactiveVariable.removeListener(listener);
  }
}
