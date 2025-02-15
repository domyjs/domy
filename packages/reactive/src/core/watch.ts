import { reactivesVariablesList } from './data';
import { globalWatch } from './globalWatch';
import { matchPath } from './matchPath';
import { Listener, ReactiveVariable } from './ReactiveVariable';
import { trackCallback } from './trackDeps';

/**
 * Remove a listener from some reactives variables
 * @param fn
 * @param objsToWatch
 *
 * @author yoannchb-pro
 */
function unwatch(listener: Listener, reactivesInstancesToUnwatch: ReactiveVariable[]) {
  for (const reactiveVariable of reactivesInstancesToUnwatch) {
    reactiveVariable?.removeListener(listener);
  }
}

/**
 * Attach a listener to some reactives variables
 * The effect can return either an object or either an array
 * @param fn
 * @param objsToWatch
 *
 * @author yoannchb-pro
 */
export function watch(listener: Listener, effect: () => any) {
  const objsToWatch: { path?: string; obj: unknown }[] = [];

  const removeEffect = globalWatch(
    {
      type: 'onGet',
      fn: ({ obj, path }) => objsToWatch.push({ path, obj })
    },
    false
  );

  // We listen to deep property call
  // Example:
  // const todo = reactive({ title: "Fork Domy On Github", isCompleted: false })
  // watch(..., () => todo.title)
  const obj = effect();

  removeEffect();

  // We add the current reactive variable to the watcher or handle the case it's an array of reactive variable
  const registerObj = (o: unknown) =>
    ReactiveVariable.isReactive(o) &&
    !objsToWatch.find(({ obj }) => obj === o) &&
    objsToWatch.push({ obj: o });
  if (!ReactiveVariable.isReactive(obj) && Array.isArray(obj)) {
    for (const o of obj) {
      registerObj(o);
    }
  } else {
    registerObj(obj);
  }

  // We create a wrapper on the current listener to ensure to only run the watcher function on a depp property change
  // For example when we watch todo.title we only want to call the watcher if title is modifier not isCompleted
  const watcherListener: Listener = {
    type: listener.type,
    fn: (props: Parameters<Listener['fn']>[0]) => {
      for (const objToWatch of objsToWatch) {
        if (!objToWatch.path && props.obj === objToWatch.obj) {
          listener.fn(props as any);
          break;
        } else if (objToWatch.path) {
          const matcher = matchPath(objToWatch.path, props.path);
          if (matcher.isMatching) {
            listener.fn(props as any);
            break;
          }
        }
      }
    }
  };

  const reactiveInstances = objsToWatch.map(
    ({ obj }) => reactivesVariablesList.get(obj) as ReactiveVariable
  );

  for (const reactiveInstance of reactiveInstances) {
    reactiveInstance?.attachListener(watcherListener);
  }

  const unwatchFn = () => unwatch(watcherListener, reactiveInstances);

  // Tracking watcher creation
  if (trackCallback) trackCallback({ type: 'watcher', unwatch: unwatchFn });

  return unwatchFn;
}
