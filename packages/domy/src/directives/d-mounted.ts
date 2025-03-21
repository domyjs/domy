import { DomyDirectiveHelper, DomyDirectiveReturn } from '../types/Domy';

/**
 * d-mounted implementation
 * Allow to execute some javascript/a function when an element and his childrens are mounted
 * Example:
 * <div d-mounted="console.log($refs.text.textContent)">
 *  <p d-ref="text">...</p>
 * </div>
 * @param domy
 *
 * @author yoannchb-pro
 */
export function dMountedImplementation(domy: DomyDirectiveHelper): DomyDirectiveReturn {
  domy.onElementMounted(() => {
    const executedValue = domy.evaluate(domy.attr.value);
    if (typeof executedValue === 'function') executedValue();
  });
}
