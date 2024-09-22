import { globalListenersList } from './data';
import { Listener } from './ReactiveVariable';
import { removeGlobalWatch } from './removeGlobalWatch';

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
