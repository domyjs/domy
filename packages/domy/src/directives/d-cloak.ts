import { DomyDirectiveHelper, DomyDirectiveReturn } from '../types/Domy';

/**
 * d-cloak implementation
 * @param domy
 *
 * @author yoannchb-pro
 */
export function dCloakImplementation(domy: DomyDirectiveHelper): DomyDirectiveReturn {
  // We render the child first to we know the d-cloak attribute will be remove after child rendered
  for (const child of domy.el.childNodes) {
    domy.deepRender({
      element: child as Element,
      state: domy.state
    });
  }

  return {
    skipChildsRendering: true
  };
}
