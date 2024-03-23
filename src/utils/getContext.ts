import { State } from '@typing/State';
import { dispatchCustomEvent } from './dispatchCustomEvent';
import { Signal } from '@core/Signal';

/**
 * Create the context for the application with datas and functions
 * @param $state
 * @returns
 */
export function getContext($el: Element | Text | undefined, $state: State) {
  const $stateDatas = $state.$state.reduce((a, b) => ({ ...a, [b.name]: b }), {});
  const $stateFn = Object.entries($state.$fn).reduce(
    (a, b) => ({
      ...a,
      [b[0]]: function (...args: any[]) {
        b[1].call(context, ...args);
      }
    }),
    {}
  );

  // The context
  const contextDatas = {
    ...window,
    ...$stateDatas,
    ...$stateFn,
    $el,
    $refs: $state.$refs,
    $dispatch: dispatchCustomEvent($state)
  };

  // Add a proxy for some magic to turn it like this:
  // this.count.value -> this.count
  // this.count.set((old) => old += 10) -> this.count += 10
  const context = new Proxy(contextDatas, {
    get(target, key, receiver) {
      if (typeof key === 'symbol' || !(key in target)) return;

      const typedKey = key as keyof typeof target;

      if (target[typedKey] instanceof Signal) {
        return target[typedKey].value;
      }

      return Reflect.get(target, key, receiver);
    },
    set(target, key, newValue, receiver) {
      if (typeof key === 'symbol' || !(key in target)) return false;

      const typedKey = key as keyof typeof target;

      if (target[typedKey] instanceof Signal) {
        return target[typedKey].set(newValue);
      }

      return Reflect.set(target, key, newValue, receiver);
    }
  });

  return context;
}
