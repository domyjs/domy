import { globalWatch } from './globalWatch';
import { matchPath } from './matchPath';

/**
 * Act like a watcher but get his dependencies it self by running one time the instance
 * Example:
 * const todo = reactive({ title: "Yoann", isCompleted: false });
 * const uneffect = effect(() => console.log(todo.title)); // Will display: "Yoann" when initialising
 * todo.isCompleted = true; // Don't call the effect
 * todo.title = "Pierre"; // Will cal the effect and display "Pierre"
 * @param effectFn
 *
 * @author yoannchb-pro
 */
export function effectFn(effect: () => void): () => void {
  const objsToWatch: { path: string; obj: unknown }[] = [];

  const removeGlobalWatch = globalWatch({
    type: 'onGet',
    fn: ({ path, obj }) => objsToWatch.push({ path, obj })
  });

  effect();

  removeGlobalWatch();

  let uneffect = globalWatch({
    type: 'onSet',
    fn: ({ path, obj }) => {
      for (const objToWatch of objsToWatch) {
        const matcher = matchPath(path, objToWatch.path);
        if (matcher.isMatching && obj === objToWatch.obj) {
          uneffect();
          uneffect = effectFn(effect); // We listen to the new dependencies of the effect
          break;
        }
      }
    }
  });

  return () => uneffect();
}
