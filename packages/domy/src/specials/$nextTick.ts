import { queueJob } from '../core/scheduler';

/**
 * Wait until domy finished updating dependencies
 * Exemple:
 * With msg: ""
 * <p @click="() => {
 *   msg = 'Hello World!';
 *   $nextTick(() => console.log($el.textContent)); // Hello World!
 * }">{{ msg }}</p>
 * @returns
 *
 * @author yoannchb-pro
 */
export function $nextTick() {
  return (cb: () => void | Promise<void>) => {
    return new Promise(resolve => {
      queueJob(() => {
        if (typeof cb === 'function') cb();
        resolve(undefined);
      });
    });
  };
}
