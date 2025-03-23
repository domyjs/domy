import { globalWatch } from './globalWatch';
import { matchPath } from './matchPath';
import { OnSetListener } from './ReactiveVariable';
import { trackCallback } from './trackDeps';

type Effect = () => any;
type UnEffect = () => void;
type WatchEffectOptions = {
  noSelfUpdate?: boolean; // Avoid the effect to launch the function again
  onDepChange?: (uneffect: UnEffect) => void;
};

let watchEffectDepth = 0;

/**
 * Act like a watcher but get his dependencies it self by running one time the instance
 * Example:
 * const todo = reactive({ title: "Yoann", isCompleted: false });
 * const uneffect = watchEffect(() => console.log(todo.title)); // Will display: "Yoann" when initialising
 * todo.isCompleted = true; // Don't call the effect
 * todo.title = "Pierre"; // Will call the effect and display "Pierre"
 * @param effectFn
 *
 * @author yoannchb-pro
 */
export function watchEffect(effect: Effect, opts: WatchEffectOptions = {}): UnEffect {
  ++watchEffectDepth;

  const removeListenersSet = new Set<() => void>();

  function clean() {
    for (const removeListener of removeListenersSet) {
      removeListener();
    }
    removeListenersSet.clear();
  }

  function watchDeps() {
    clean(); // We remove the last dependencies to listen to the new ones

    const currentWatchEffectDepth = watchEffectDepth;
    const dependencyMap = new Map<any, Set<string>>();

    let listenerAlreadyMatched = false;
    const removeGlobalWatch = globalWatch(
      {
        type: 'onGet',
        fn: ({ path, reactiveVariable }) => {
          // If the currentwatch effect depth is not the same then it mean we have an effect in an effect
          // In this case we don't want to listen to the effect child deps
          if (currentWatchEffectDepth !== watchEffectDepth) return;

          const listener: OnSetListener = {
            type: 'onSet',
            fn: toWatch => {
              if (listenerAlreadyMatched) return;

              const matcher = matchPath(toWatch.path, path);
              if (matcher.isMatching) {
                listenerAlreadyMatched = true;
                if (opts.onDepChange) opts.onDepChange(clean);
                if (!opts.noSelfUpdate) watchDeps();
              }
            }
          };

          // We check the dep is not already registered
          const currentDeps = dependencyMap.get(reactiveVariable) || new Set<string>();
          if (currentDeps.has(path)) return;
          currentDeps.add(path);
          dependencyMap.set(reactiveVariable, currentDeps);

          // We attach the on set listener
          const removeListener = () => reactiveVariable.removeListener(listener);
          removeListenersSet.add(removeListener);
          reactiveVariable.attachListener(listener);
        }
      },
      false
    );

    try {
      effect();
      --watchEffectDepth;
    } finally {
      removeGlobalWatch();
    }
  }

  watchDeps();

  if (trackCallback) trackCallback({ type: 'effect', clean });

  return clean;
}
