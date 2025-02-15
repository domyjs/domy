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
  const index = globalListenersList.findIndex(l => l === listener);
  globalListenersList.splice(index, 1);
}

/**
 * Attach a listener to all reactive variables
 * @param listener
 *
 * @author yoannchb-pro
 */
export function globalWatch(listener: Listener, tracking = true) {
  globalListenersList.push(listener);
  const unwatch = () => removeGlobalWatch(listener);

  // Tracking global watch
  if (trackCallback && tracking)
    trackCallback({ type: 'global_watcher', removeGlobalWatcher: unwatch });

  return unwatch;
}
