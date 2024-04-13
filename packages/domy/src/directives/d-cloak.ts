import { DomyDirectiveHelper, DomyDirectiveReturn } from '../types/Domy';

/**
 * d-cloak implementation
 * @param domy
 *
 * @author yoannchb-pro
 */
export function dCloakImplementation(domy: DomyDirectiveHelper): DomyDirectiveReturn {
  // We render the element and child first so we know the d-cloak attribute will be remove after child rendered
  domy.deepRender({
    element: domy.el,
    state: domy.state,
    byPassAttributes: [domy.attr.name]
  });

  return {
    skipChildsRendering: true,
    skipOtherAttributesRendering: true
  };
}
