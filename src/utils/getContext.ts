import { State } from '@typing/State';
import { dispatchCustomEvent } from './dispatchCustomEvent';

/**
 * Create the context for the application with datas and functions
 * @param $state
 * @returns
 */
export function getContext($el: Element | Text | undefined, $state: State) {
  const $stateDatas = $state.$state.reduce((a, b) => ({ ...a, [b.name]: b }), {});
  const $stateFn = Object.entries($state.$fn).reduce(
    (a, b) => ({ ...a, [b[0]]: (...args: any[]) => b[1].call(context, ...args) }),
    {}
  );
  const context = {
    ...window,
    ...$stateDatas,
    ...$stateFn,
    $el,
    $refs: $state.$refs,
    $dispatch: dispatchCustomEvent($state)
  };
  return context;
}
