import { DomyDirectiveHelper, DomyDirectiveReturn } from '../types/Domy';

/**
 * d-once implementation
 * @param domy
 *
 * @author yoannchb-pro
 */
export function dOnceImplementation(domy: DomyDirectiveHelper): DomyDirectiveReturn {
  domy.deepRender({
    element: domy.el,
    state: domy.state,
    byPassAttributes: ['d-once'],
    renderWithoutListeningToChange: true
  });

  return { skipChildsRendering: true, skipOtherAttributesRendering: true };
}
