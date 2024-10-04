import { reactivesVariablesList } from './data';
import { globalWatch } from './globalWatch';
import { Listener, ReactiveVariable } from './ReactiveVariable';
import { unwatch } from './unwatch';

/**
 * Attach a listener to some reactives variables
 * The effect can return either an object or either an array
 * @param fn
 * @param objsToWatch
 *
 * @author yoannchb-pro
 */
export function watch(listener: Listener, effect: () => any) {
  const objsToWatch: any[] = [];

  const removeEffect = globalWatch({
    type: 'onGet',
    fn: ({ obj }) => objsToWatch.push(obj)
  });

  // We listen to deep property
  // Example:
  // const todo = reactive({ title: "Fork Domy On Github" })
  // watch(..., () => todo.title)
  const obj = effect();

  removeEffect();

  // We add the current object to the watcher and handle the case it's an array of reactive variable
  const registerObj = (o: any) =>
    ReactiveVariable.isReactive(o) && objsToWatch.indexOf(o) === -1 && objsToWatch.push(o);
  if (!ReactiveVariable.isReactive(obj) && Array.isArray(obj)) {
    for (const o of obj) {
      registerObj(o);
    }
  } else {
    registerObj(obj);
  }

  const reactiveInstances = objsToWatch.map(obj => reactivesVariablesList.get(obj));

  for (const reactiveInstance of reactiveInstances) {
    reactiveInstance?.attachListener(listener);
  }

  return () => unwatch(listener, objsToWatch);
}
