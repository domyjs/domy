import { DomyDirectiveHelper, DomyDirectiveReturn } from '../types/Domy';

/**
 * d-name implementation
 * This attribute allow the component to identify a child
 * The component can use the helper $names['MyName'] to retrieve the child
 * @param domy
 *
 * @author yoannchb-pro
 */
export function dNameImplementation(domy: DomyDirectiveHelper): DomyDirectiveReturn {
  domy.block.name = domy.attr.value;
}
