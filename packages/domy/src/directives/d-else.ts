import { DomyDirectiveHelper, DomyDirectiveReturn } from '@domyjs/types/src/Domy';
import { getElementVisibilityHandler } from '../utils/getElementVisibilityHandler';
import { getPreviousConditionsElements } from '../utils/getPreviousConditionsElements';
import { GlobalMutationObserver } from '../utils/GlobalMutationObserver';

/**
 * d-else implementation
 * Like like a } else { in javascript
 * The element is only rendered when displayed
 * It also handle animation
 * @param domy
 *
 * @author yoannchb-pro
 */
export function dElseImplementation(domy: DomyDirectiveHelper): DomyDirectiveReturn {
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
      return allPreviousConditionsAreDisconnected;
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

  visibilityHandler();

  return { skipChildsRendering: true, skipOtherAttributesRendering: true };
}
