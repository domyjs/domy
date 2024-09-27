import { WatcherFn } from '../types/App';
import { DomyDirectiveHelper } from '../types/Domy';
import { warn } from '../utils/logs';

/**
 * d-watch implementation
 * Allow to watch for a specific change into scoped data
 * Example:
 * <div d-scope="{ count: 0 }" d-watch.count="(prevValue, newValue) => { if(newValue < 0) count = prevValue }">...</div>
 * @param domy
 *
 * @author yoannchb-pro
 */
export function dWatchImplementation(domy: DomyDirectiveHelper) {
  if (domy.modifiers.length === 0)
    throw new Error(
      `At least one key has to be provided for the "${domy.directive}" directive (example: d-watch.count="...").`
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

  if (keysToWatch.size === 0 || objsToWatch.size === 0) return;

  // We add the watcher on the watched scoped data with a lock to avoid calling it self
  let isLock = false;
  const unwatch = domy.watch(
    {
      type: 'onSet',
      fn: props => {
        if (isLock) return;

        isLock = true;

        for (const keyToWatch of keysToWatch) {
          const matcher = domy.matchPath(keyToWatch, props.path);
          if (matcher.isMatching) {
            const executedValue = domy.evaluateWithoutListening(domy.attr.value);
            if (typeof executedValue === 'function')
              domy.queueJob(() => {
                executedValue(props.prevValue, props.newValue, {
                  path: props.path,
                  params: matcher.params
                }) as WatcherFn;
              });
            break;
          }
        }

        isLock = false;
      }
    },
    Array.from(objsToWatch)
  );

  domy.cleanup(unwatch);
}
