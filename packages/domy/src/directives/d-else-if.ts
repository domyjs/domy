import { DomyDirectiveHelper, DomyDirectiveReturn } from '../types/Domy';
import { getElementVisibilityHandler } from '../utils/getElementVisibilityHandler';
import { getPreviousConditionsElements } from '../utils/getPreviousConditionsElements';
import { GlobalMutationObserver } from '../utils/GlobalMutationObserver';

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

  const allPreviousConditions = getPreviousConditionsElements(el, ['d-if', 'd-else-if']);

  if (allPreviousConditions.length === 0) {
    throw new Error(`"${domy.attrName}" should be preceded by "d-if" or "d-else-if" element.`);
  }

  const visibilityHandler = getElementVisibilityHandler({
    shouldBeDisplay: () => {
      const allPreviousConditionsAreDisconnected = !allPreviousConditions.find(
        el => el.isConnected
      );
      const shouldBeDisplay =
        allPreviousConditionsAreDisconnected && domy.evaluate(domy.attr.value);
      return shouldBeDisplay;
    },
    domy
  });

  GlobalMutationObserver.getInstance().watch(
    allPreviousConditions,
    (element, mutation) =>
      mutation.type === 'childList' && // Ensure the mutation is an added or removed node
      allPreviousConditions.includes(element as Element) && // Ensure the added or removed node is not a deep children but one of the conditions
      visibilityHandler()
  );

  domy.effect(visibilityHandler);

  return { skipChildsRendering: true, skipOtherAttributesRendering: true };
}
