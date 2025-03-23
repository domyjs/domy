import { globalListenersList } from './data';
import { Listener } from './ReactiveVariable';
import { trackCallback } from './trackDeps';

/**
 * Remove a global listener
 * @param listener
 *
 * @author yoannchb-pro
 */
function removeGlobalWatch(listener: Listener) {
  if (globalListenersList.has(listener)) globalListenersList.delete(listener);
}

/**
 * Attach a listener to all reactive variables
 * @param listener
 *
 * @author yoannchb-pro
 */
export function globalWatch(listener: Listener, tracking = true) {
  globalListenersList.add(listener);
  const clean = () => removeGlobalWatch(listener);

  // Tracking global watch
  if (trackCallback && tracking) trackCallback({ type: 'global_watcher', clean });

  return clean;
}
