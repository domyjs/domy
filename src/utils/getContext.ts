import { State } from '@typing/State';

/**
 * Create the context for the application with datas and functions
 * @param $state
 * @returns
 */
export function getContext($state: State) {
  const $stateDatas = $state.$state.reduce((a, b) => ({ ...a, [b.name]: b }), {});
  const $stateFn = Object.entries($state.$fn).reduce(
    (a, b) => ({ ...a, [b[0]]: (...args: any[]) => b[1].call(context, ...args) }),
    {}
  );
  const context = { ...window, ...$stateDatas, ...$stateFn };
  return context;
}
