import { DomyDirectiveHelper } from '../types/Domy';

/**
 * d-weffect implementation
 * Allow to watch dependencies change of some code
 * Example:
 * <div d-scope="{ count: 0 }" d-effect="count < 0 ? count = 0 : null">...</div>
 * @param domy
 *
 * @author yoannchb-pro
 */
export function dEffectImplementation(domy: DomyDirectiveHelper) {
  const uneffect = domy.utils.queuedWatchEffect(() => {
    const executedValue = domy.evaluate(domy.attr.value);
    if (typeof executedValue === 'function') executedValue();
  });

  domy.cleanup(uneffect);
}
