import { watchEffect } from '@domyjs/reactive';
import { getUniqueQueueId, queueJob } from '../core/scheduler';

type Options = {
  dontQueueOnFirstExecution?: boolean;
  effectId?: number;
};

/**
 * Allow to queue an effect
 * @param effect
 * @param opts
 *
 * @author yoannchb-pro
 */
export function queuedWatchEffect(effect: () => any, opts: Options = {}) {
  let currUnEffect: (() => void) | null = null;

  opts.effectId = opts.effectId ?? getUniqueQueueId();

  function makeEffect() {
    currUnEffect = watchEffect(effect, {
      // make sure the job is queue again and we listen for dep changes
      onDepChange: uneffect => {
        uneffect();
        queueJob(makeEffect, opts.effectId as number);
      },
      noSelfUpdate: true
    });
  }

  if (opts.dontQueueOnFirstExecution) {
    makeEffect();
  } else queueJob(makeEffect, opts.effectId);

  return () => {
    if (currUnEffect) {
      currUnEffect();
      currUnEffect = null;
    }
  };
}
