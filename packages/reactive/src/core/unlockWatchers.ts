import { reactivesVariablesList } from './data';

/**
 * Unlock every watchers
 *
 * @author yoannchb-pro
 */
export function unlockWatchers() {
  for (const reactiveVariable of reactivesVariablesList.values()) {
    reactiveVariable.isLock = false;
  }
}
