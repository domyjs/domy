import { DomyDirectiveHelper, DomyDirectiveReturn } from '@domyjs/types/src/Domy';
import { getElementVisibilityHandler } from '../utils/getElementVisibilityHandler';

/**
 * d-if implementation
 * Like like a if(condition) {} in javascript
 * The element is only rendered when displayed
 * It also handle animation
 * @param domy
 *
 * @author yoannchb-pro
 */
export function dIfImplementation(domy: DomyDirectiveHelper): DomyDirectiveReturn {
  const visibilityHandler = getElementVisibilityHandler({
    shouldBeDisplay: () => domy.evaluate(domy.attr.value),
    domy
  });

  domy.effect(visibilityHandler);

  return { skipChildsRendering: true, skipOtherAttributesRendering: true };
}
