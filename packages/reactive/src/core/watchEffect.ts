import { reactivesVariablesList } from './data';
import { globalWatch } from './globalWatch';
import { matchPath } from './matchPath';
import { OnSetListener, ReactiveVariable } from './ReactiveVariable';
import { trackCallback } from './trackDeps';

type Effect = () => any;
type UnEffect = () => void;
type WatchEffectOptions = {
  noSelfUpdate?: boolean; // Avoid the effect to launch the function again
  onDepChange?: (uneffect: UnEffect) => void;
};

const watchDepsQueue: (() => void)[] = [];
let isRunning = false;

/**
 * Drain the effect queue by executing each effect in the order they were added.
 * We do that because an effect can call an other effect inside
 * And we don't want this effect to know the other effect dependencies
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
  const previousListeners: { reactiveVariable: ReactiveVariable; listener: OnSetListener }[] = [];

  function uneffectPrevious() {
    for (const previousListener of previousListeners) {
      previousListener.reactiveVariable.removeListener(previousListener.listener);
    }
  }

  function watchDeps() {
    uneffectPrevious(); // We remove the last dependencies

    if (isRunning) {
      if (!watchDepsQueue.includes(watchDeps)) {
        watchDepsQueue.push(watchDeps);
      }
      return;
    }

    isRunning = true;

    const removeGlobalWatch = globalWatch(
      {
        type: 'onGet',
        fn: ({ path: getPath, obj }) => {
          const reactiveVariable = reactivesVariablesList.get(obj);
          if (!reactiveVariable) return;

          // We attach the listener to the reactive variable
          const listener: OnSetListener = {
            type: 'onSet',
            fn: ({ path: setPath }) => {
              if (matchPath(getPath, setPath).isMatching) {
                if (opts.onDepChange) opts.onDepChange(uneffectFn);
                if (!opts.noSelfUpdate) watchDeps();
              }
            }
          };
          reactiveVariable.attachListener(listener);
          previousListeners.push({ reactiveVariable, listener });
        }
      },
      false
    );

    try {
      effect();
    } finally {
      removeGlobalWatch();
      isRunning = false;
      nextWatchDeps();
    }
  }

  watchDeps();

  function uneffectFn() {
    const index = watchDepsQueue.indexOf(watchDeps);
    if (index !== -1) watchDepsQueue.splice(index, 1);
    uneffectPrevious();
  }

  // Tracking effect creation
  if (trackCallback) trackCallback({ type: 'effect', uneffect: uneffectFn });

  return uneffectFn;
}
