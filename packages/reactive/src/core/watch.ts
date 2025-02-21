import { reactivesVariablesList } from './data';
import { globalWatch } from './globalWatch';
import { isReactive } from './isReactive';
import { matchPath } from './matchPath';
import { Listener, ReactiveVariable } from './ReactiveVariable';
import { trackCallback } from './trackDeps';

/**
 * Attach a listener to some reactives variables
 * @param listener
 * @param effect
 *
 * @author yoannchb-pro
 */
export function watch(listener: Listener, effect: () => any) {
  const removeWatcherLists: (() => void)[] = [];

  function registerListener(reactiveVariable: ReactiveVariable, obj: any, path?: string) {
    const overideListener: Listener = {
      type: listener.type,
      fn: (props: Parameters<Listener['fn']>[0]) => {
        if (!path) {
          if (obj === props.obj) listener.fn(props as any);
          return;
        }

        const matcher = matchPath(path, props.path);
        if (matcher.isMatching) {
          listener.fn(props as any);
        }
      }
    };

    const removeWatcher = reactiveVariable.attachListener(overideListener);
    removeWatcherLists.push(removeWatcher);
  }

  const removeEffect = globalWatch(
    {
      type: 'onGet',
      fn: ({ path, obj, reactiveVariable }) => registerListener(reactiveVariable, obj, path)
    },
    false
  );

  // We listen to deep property call
  // Example:
  // const todo = reactive({ title: "Fork Domy On Github", isCompleted: false })
  // watch(..., () => todo.title)
  const deps = effect();

  removeEffect();

  // In case we want to watch directly the signal or reactive without passing by the properties
  if (Array.isArray(deps)) {
    for (const dep of deps) {
      if (isReactive(dep)) registerListener(reactivesVariablesList.get(dep)!, dep);
    }
  } else {
    if (isReactive(deps)) registerListener(reactivesVariablesList.get(deps)!, deps);
  }

  const clean = () => {
    for (const removeWatcher of removeWatcherLists) {
      removeWatcher();
    }
  };

  // Tracking watcher creation
  if (trackCallback) trackCallback({ type: 'watcher', clean });

  return clean;
}
