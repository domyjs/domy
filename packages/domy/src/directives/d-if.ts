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
    disconnectAction: (element, unmount) => {
      element.remove();
      if (unmount) unmount();
    },
    domy
  });

  domy.effect(visibilityHandler);

  return { skipChildsRendering: true, skipOtherAttributesRendering: true };
}
