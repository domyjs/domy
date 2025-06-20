import { DomyDirectiveHelper, DomyDirectiveReturn } from '../types/Domy';

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
  const visibilityHandler = domy.utils.getElementVisibilityHandler({
    shouldBeDisplay: () => domy.evaluate(domy.attr.value),
    domy
  });

  domy.effect(visibilityHandler.effect);
  domy.cleanup(visibilityHandler.cleanup);

  return {
    skipChildsRendering: true,
    skipOtherAttributesRendering: true,
    skipComponentRendering: true
  };
}
