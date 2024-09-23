import { DomyDirectiveHelper, DomyDirectiveReturn } from '../types/Domy';

/**
 * d-else-if implementation
 * Like like a } else if(condition) { in javascript
 * The element is only rendered when displayed
 * It also handle animation
 * @param domy
 *
 * @author yoannchb-pro
 */
export function dElseIfImplementation(domy: DomyDirectiveHelper): DomyDirectiveReturn {
  const el = domy.el as HTMLElement;

  const allPreviousConditions = domy.utils.getPreviousConditionsElements(el, ['d-if', 'd-else-if']);

  if (allPreviousConditions.length === 0) {
    throw new Error(`"${domy.attrName}" should be preceded by "d-if" or "d-else-if" element.`);
  }

  const mergedNegativeCondition = domy.utils.mergeToNegativeCondition(
    allPreviousConditions.map(
      previousCondition =>
        previousCondition.getAttribute('d-if') || previousCondition.getAttribute('d-else-if') || ''
    )
  );

  const visibilityHandler = domy.utils.getElementVisibilityHandler({
    shouldBeDisplay: () => domy.evaluate(mergedNegativeCondition) && domy.evaluate(domy.attr.value),
    disconnectAction: (element, unmount) => {
      element.remove();
      if (unmount) unmount();
    },
    domy
  });

  domy.effect(visibilityHandler);

  return { skipChildsRendering: true, skipOtherAttributesRendering: true };
}
