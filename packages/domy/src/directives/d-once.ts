import { DomyDirectiveHelper, DomyDirectiveReturn } from '../types/Domy';

/**
 * d-once implementation
 * Only execute one time the rendering of an element
 * So even if a dependencie change the effect will not be trigger again
 * @param domy
 *
 * @author yoannchb-pro
 */
export function dOnceImplementation(domy: DomyDirectiveHelper): DomyDirectiveReturn {
  domy.deepRender({
    element: domy.el,
    state: domy.state,
    byPassAttributes: [domy.attr.name],
    scopedNodeData: domy.scopedNodeData,
    renderWithoutListeningToChange: true
  });

  return { skipChildsRendering: true, skipOtherAttributesRendering: true };
}
