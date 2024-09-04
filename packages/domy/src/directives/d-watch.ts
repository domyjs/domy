import { DomyDirectiveHelper } from '../types/Domy';
import { error, warn } from '../utils/logs';

/**
 * d-watch implementation
 * Allow to watch for a specific change into scoped data
 * Example:
 * <div d-scope="{ count: 0 }" d-watch.count="({ newValue, prevValue }) => { if(newValue < 0) count = prevValue }">...</div>
 * @param domy
 *
 * @author yoannchb-pro
 */
export function dWatchImplementation(domy: DomyDirectiveHelper) {
  if (domy.modifiers.length === 0)
    throw new Error(
      `At least one key has to be provided for the watch directive (example: d-watch.count="...").`
    );

  const objsToWatch = new Set<any>();
  const keysToWatch = new Set<string>();

  // We find the key to watch and the object to watch
  for (const keyToWatch of domy.modifiers) {
    if (keysToWatch.has(keyToWatch)) {
      warn(`Duplicate key to watch "${keyToWatch}".`);
      continue;
    }

    const objToWatch = domy.scopedNodeData.find(obj => keyToWatch in obj);

    if (!objToWatch) {
      warn(`WATCH: Unable to find "${keyToWatch}". Note you can only watch scoped data.`);
      continue;
    }

    objsToWatch.add(objToWatch);
    keysToWatch.add(keyToWatch);
  }

  // We add the watcher on the watched scoped data with a lock to avoid calling it self
  if (keysToWatch.size > 0 && objsToWatch.size > 0) {
    let isLock = false;

    domy.watch(
      {
        type: 'onSet',
        fn: props => {
          if (isLock) return;

          isLock = true;

          for (const keyToWatch of keysToWatch) {
            if (domy.matchPath(keyToWatch, props.path).isMatching) {
              const value = domy.evaluateWithoutListening(domy.attr.value);
              if (typeof value === 'function') domy.queueJob(() => value(props));
              break; // Ensure we call the watcher only one time
            }
          }

          isLock = false;
        }
      },
      Array.from(objsToWatch)
    );
  }
}
