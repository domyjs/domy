import { globalListenersList } from './data';
import { Listener } from './ReactiveVariable';

/**
 * Attach a listener to all reactive variables
 * @param listener
 *
 * @author yoannchb-pro
 */
export function globalWatch(listener: Listener) {
  globalListenersList.push(listener);
}
