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
  const objsToWatch = new Set<any>();
  const keysToWatch = new Set<string>();

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
              try {
                const value = domy.evaluateWithoutListening(domy.attr.value);
                if (typeof value === 'function') value(props);
              } catch (err: any) {
                error(err);
              }
            }
          }

          isLock = false;
        }
      },
      Array.from(objsToWatch)
    );
  }
}
