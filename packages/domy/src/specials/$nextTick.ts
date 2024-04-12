import { queueJob } from '../core/scheduler';

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
