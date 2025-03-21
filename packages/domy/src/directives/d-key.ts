import { DomyDirectiveHelper, DomyDirectiveReturn } from '../types/Domy';

/**
 * d-key implementation
 * Allow to keep track of change into an array
 * It have to be combined with d-for
 * Example:
 * <ul d-for="element of array">
 *  <li d-key="element.id">...</li>
 * </ul>
 * @param domy
 *
 * @author yoannchb-pro
 */
export function dKeyImplementation(domy: DomyDirectiveHelper): DomyDirectiveReturn {
  domy.effect(() => {
    const key = domy.evaluate(domy.attr.value);
    domy.block.key = key;
  });
}
