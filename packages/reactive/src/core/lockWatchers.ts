import { reactivesVariablesList } from './data';

/**
 * Allow us to lock every watcher if we need to do a set/get action on the object without calling the watcher
 *
 * @author yoannchb-pro
 */
export function lockWatchers() {
  for (const reactiveVariable of reactivesVariablesList.values()) {
    reactiveVariable.isLock = true;
  }
}
