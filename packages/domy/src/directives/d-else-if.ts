import { DomyDirectiveHelper, DomyDirectiveReturn } from '../types/Domy';
import { getElementVisibilityHandler } from '../utils/getElementVisibilityHandler';
import { IsConnectedWatcher } from '../utils/IsConnectedWatcher';

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
  const previousConditionElement = domy.el.previousElementSibling;

  if (
    !previousConditionElement ||
    (!previousConditionElement.getAttribute('d-if') &&
      !previousConditionElement.getAttribute('d-else-if'))
  ) {
    throw new Error(`"${domy.attrName}" should be preceded by "d-if" or "d-else-if" element.`);
  }

  // We get all the previous elements which are part of the full conditiion
  const allPreviousConditions: Element[] = [previousConditionElement];
  while (true) {
    const currentPreviousSibling =
      allPreviousConditions[allPreviousConditions.length - 1].previousElementSibling;
    if (
      !currentPreviousSibling ||
      (!currentPreviousSibling.getAttribute('d-if') &&
        !currentPreviousSibling.getAttribute('d-else-if'))
    ) {
      break;
    }
    allPreviousConditions.push(currentPreviousSibling as Element);
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

  IsConnectedWatcher.getInstance().watch(allPreviousConditions, visibilityHandler);

  domy.effect(visibilityHandler);

  return { skipChildsRendering: true, skipOtherAttributesRendering: true };
}
