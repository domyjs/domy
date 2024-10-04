import { Listener, ReactiveVariable } from './ReactiveVariable';

/**
 * Remove a listener from some reactives variables
 * @param fn
 * @param objsToWatch
 *
 * @author yoannchb-pro
 */
export function unwatch(listener: Listener, reactivesInstancesToUnwatch: ReactiveVariable[]) {
  for (const reactiveVariable of reactivesInstancesToUnwatch) {
    reactiveVariable?.removeListener(listener);
  }
}
