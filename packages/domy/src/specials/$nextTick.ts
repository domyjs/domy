import { queueJob } from '../core/scheduler';

export function nextTick(cb: () => void | Promise<void>) {
  return new Promise(resolve => {
    queueJob(() => {
      cb();
      resolve(undefined);
    });
  });
}
