import { ReactiveVariable } from './ReactiveVariable';

type Dep =
  | {
      type: 'reactive_variable_creation';
      reactiveVariable: ReactiveVariable;
      clean: () => void;
    }
  | {
      type: 'watcher' | 'effect' | 'global_watcher';
      clean: () => void;
    };

export let trackCallback: ((dep: Dep) => void) | null = null;

/**
 * Allow us to track inside a function:
 * - reactive variable (signal + reactive)
 * - watcher
 * - effects
 * - global watchers
 * @param fn
 * @returns
 *
 * @author yoannchb-pro
 */
export function trackDeps(fn: () => any): Dep[] {
  const deps: Dep[] = [];

  trackCallback = (dep: Dep) => deps.push(dep);

  // we execute the function so track deps
  fn();

  trackCallback = null;

  return deps;
}
