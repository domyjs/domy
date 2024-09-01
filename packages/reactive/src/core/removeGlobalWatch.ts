import { globalListenersList } from './data';
import { Listener } from './ReactiveVariable';

/**
 * Remove a global listener
 * @param listener
 *
 * @author yoannchb-pro
 */
export function removeGlobalWatch(listener: Listener) {
  const index = globalListenersList.findIndex(l => l === listener);
  globalListenersList.splice(index, 1);
}
