import { getUniqueQueueId, queueJob } from '../core/scheduler';

/**
 * Wait until domy finished updating dependencies
 * Exemple:
 * With msg: ""
 * <p @click="() => {
 *   msg = 'Hello World!';
 *   console.log($el.textContent); // ""
 *   $nextTick(() => console.log($el.textContent)); // "Hello World!"
 * }">{{ msg }}</p>
 * @returns
 *
 * @author yoannchb-pro
 */
export function $nextTick() {
  const queueId = getUniqueQueueId();

  return (cb?: () => void | Promise<void>) => {
    return new Promise(resolve => {
      queueJob(() => {
        if (typeof cb === 'function') cb();
        resolve(true);
      }, queueId);
    });
  };
}
