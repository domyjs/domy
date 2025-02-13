import { queuedWatchEffect } from '../utils/queuedWatchEffect';

/**
 * Allow to look for dependencies change in an effect functino
 * @param domy
 * @returns
 *
 * @author yoannchb-pro
 */
export function $effect() {
  return (effect: () => any) => {
    const uneffect = queuedWatchEffect(effect);
    return uneffect;
  };
}
