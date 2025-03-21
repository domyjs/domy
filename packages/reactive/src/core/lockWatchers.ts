import { ReactiveVariable } from './ReactiveVariable';

/**
 * Allow us to lock every watcher if we need to do a set/get action on the object without calling the watcher
 *
 * @author yoannchb-pro
 */
export function lockWatchers() {
  ReactiveVariable.IS_GLOBAL_LOCK = true;
}
