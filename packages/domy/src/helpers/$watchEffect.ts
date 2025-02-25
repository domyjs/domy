import { queuedWatchEffect } from '../utils/queuedWatchEffect';

/**
 * Allow to look for dependencies change in an effect function
 * @param domy
 * @returns
 *
 * @author yoannchb-pro
 */
export function $watchEffect() {
  return (effect: () => any) => {
    const uneffect = queuedWatchEffect(effect);
    return uneffect;
  };
}
