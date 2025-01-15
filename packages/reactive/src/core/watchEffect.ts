import { globalWatch } from './globalWatch';
import { matchPath } from './matchPath';

type Effect = () => any;
type UnEffect = () => void;
type WatchEffectOptions = {
  noSelfUpdate?: boolean; // Avoid the effect to launch the function again
  onDepChange?: () => void;
};

const watchDepsQueue: (() => void)[] = [];
let isRunning = false;

/**
 * Drain the effect queue by executing each effect in the order they were added.
 */
function nextWatchDeps() {
  if (watchDepsQueue.length > 0 && !isRunning) {
    const watchDeps = watchDepsQueue.shift();
    if (watchDeps) watchDeps();
  }
}

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
export function watchEffect(effect: Effect, opts: WatchEffectOptions = {}): UnEffect {
  const objsToWatch: { path: string; obj: unknown }[] = [];

  function watchDeps() {
    objsToWatch.length = 0; // We remove the last dependencies

    if (isRunning) {
      if (!watchDepsQueue.includes(watchDeps)) {
        watchDepsQueue.push(watchDeps);
      }
      return;
    }

    isRunning = true;

    const removeGlobalWatch = globalWatch({
      type: 'onGet',
      fn: ({ path, obj }) => objsToWatch.push({ path, obj })
    });

    try {
      effect();
    } finally {
      removeGlobalWatch();
      isRunning = false;
      nextWatchDeps();
    }
  }

  const uneffect = globalWatch({
    type: 'onSet',
    fn: ({ path, obj }) => {
      for (const objToWatch of objsToWatch) {
        const matcher = matchPath(objToWatch.path, path);
        if (matcher.isMatching && obj === objToWatch.obj) {
          if (opts.onDepChange) opts.onDepChange();
          if (!opts.noSelfUpdate) watchDeps();
          break;
        }
      }
    }
  });

  watchDeps();

  return uneffect;
}
