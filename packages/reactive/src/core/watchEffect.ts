import { globalWatch } from './globalWatch';
import { matchPath } from './matchPath';

/**
 * Act like a watcher but get his dependencies it self by running one time the instance
 * Example:
 * const todo = reactive({ title: "Yoann", isCompleted: false });
 * const uneffect = watchEffect(() => console.log(todo.title)); // Will display: "Yoann" when initialising
 * todo.isCompleted = true; // Don't call the effect
 * todo.title = "Pierre"; // Will cal the effect and display "Pierre"
 * @param effectFn
 *
 * @author yoannchb-pro
 */
export function watchEffect(effect: () => void): () => void {
  const objsToWatch: { path: string; obj: unknown }[] = [];

  function watchDeps() {
    const removeGlobalWatch = globalWatch({
      type: 'onGet',
      fn: ({ path, obj }) => objsToWatch.push({ path, obj })
    });

    effect();

    removeGlobalWatch();
  }

  const unwatch = globalWatch({
    type: 'onSet',
    fn: ({ path, obj }) => {
      for (const objToWatch of objsToWatch) {
        const matcher = matchPath(objToWatch.path, path);
        if (matcher.isMatching && obj === objToWatch.obj) {
          objsToWatch.length = 0; // We remove the last dependencies
          watchDeps();
          break;
        }
      }
    }
  });

  watchDeps();

  return unwatch;
}
