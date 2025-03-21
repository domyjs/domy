import { ReactiveVariable } from './ReactiveVariable';

/**
 * Unlock every watchers
 *
 * @author yoannchb-pro
 */
export function unlockWatchers() {
  ReactiveVariable.IS_GLOBAL_LOCK = false;
}
