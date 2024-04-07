import { dispatchCustomEvent } from './dispatchCustomEvent';
import { State } from '../types/State';

export function getContext(
  el: Element | Text | undefined,
  state: State,
  injectableDatas: Record<string, any>[] = []
) {
  const stateDatas = state.data.reactiveObj;
  const stateFn = Object.entries(state.methods).reduce(
    (a, b) => ({
      ...a,
      [b[0]]: function (...args: any[]) {
        return b[1].call(context, ...args);
      }
    }),
    {}
  );

  const context = {
    ...stateDatas,
    ...stateFn,
    ...injectableDatas.reduce(
      (a, b) => ({
        ...a,
        ...b
      }),
      {}
    ),
    $el: el,
    $refs: state.refs,
    $dispatch: dispatchCustomEvent(state)
  };

  return context;
}
