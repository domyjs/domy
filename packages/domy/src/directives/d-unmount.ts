import { DomyDirectiveHelper, DomyDirectiveReturn } from '../types/Domy';

/**
 * d-unmount implementation
 * Allow to execute some javascript/a function when an element is unmounted
 * @param domy
 *
 * @author yoannchb-pro
 */
export function dUnMountImplementation(domy: DomyDirectiveHelper): DomyDirectiveReturn {
  domy.cleanup(() => {
    const executedValue = domy.evaluateWithoutListening(domy.attr.value);
    if (typeof executedValue === 'function') domy.queueJob(() => executedValue());
  });
}
