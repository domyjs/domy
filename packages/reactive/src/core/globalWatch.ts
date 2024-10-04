import { globalListenersList } from './data';
import { Listener } from './ReactiveVariable';

/**
 * Remove a global listener
 * @param listener
 *
 * @author yoannchb-pro
 */
function removeGlobalWatch(listener: Listener) {
  const index = globalListenersList.findIndex(l => l === listener);
  globalListenersList.splice(index, 1);
}

/**
 * Attach a listener to all reactive variables
 * @param listener
 *
 * @author yoannchb-pro
 */
export function globalWatch(listener: Listener) {
  globalListenersList.push(listener);

  return () => removeGlobalWatch(listener);
}
