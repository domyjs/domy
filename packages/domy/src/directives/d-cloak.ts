import { DomyDirectiveHelper, DomyDirectiveReturn } from '../types/Domy';

/**
 * d-cloak implementation
 * This attribute allow the user to know when the full content of an element is rendered
 * @param domy
 *
 * @author yoannchb-pro
 */
export function dCloakImplementation(domy: DomyDirectiveHelper): DomyDirectiveReturn {
  // We render the element and child first so we know the d-cloak attribute will be remove after child rendered
  domy.onElementMounted(() => {
    // This is the only attribute which is not remove by default
    domy.block.el.removeAttribute(domy.attr.name);
  });
}
