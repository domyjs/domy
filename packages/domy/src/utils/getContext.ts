import { State } from '@domyjs/types';
import { dispatchCustomEvent } from './dispatchCustomEvent';
import { Signal } from '../core/Signal';

const proxyHandler: ProxyHandler<any> = {
  get(target, key, receiver) {
    try {
      const typedKey = key as keyof typeof target;
      const prevValue = target[typedKey];

      if (prevValue instanceof Signal) {
        return target[typedKey].value;
      }

      // eslint-disable-next-line
    } catch (err) {}

    return Reflect.get(target, key, receiver);
  },
  set(target, key, newValue, receiver) {
    try {
      const typedKey = key as keyof typeof target;
      const prevValue = target[typedKey];

      if (prevValue instanceof Signal) {
        return target[typedKey].set(newValue);
      }

      // eslint-disable-next-line
    } catch (err) {}

    return Reflect.set(target, key, newValue, receiver);
  }
};

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
        return b[1].call(context, ...args);
      }
    }),
    {}
  );

  // The context
  const contextDatas = {
    ...$stateDatas,
    ...$stateFn,
    $el,
    $refs: $state.$refs,
    $dispatch: dispatchCustomEvent($state)
  };

  // Add a proxy for some magic to turn it like this:
  // this.count.value -> this.count
  // this.count.set((old) => old += 10) -> this.count += 10
  const context = new Proxy(contextDatas, proxyHandler);

  return context;
}
