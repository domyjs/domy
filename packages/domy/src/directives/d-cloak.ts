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
  const { unmount } = domy.deepRender({
    element: domy.el,
    scopedNodeData: domy.scopedNodeData,
    byPassAttributes: [domy.attr.name]
  });

  domy.cleanup(unmount);

  return {
    skipChildsRendering: true,
    skipOtherAttributesRendering: true
  };
}
