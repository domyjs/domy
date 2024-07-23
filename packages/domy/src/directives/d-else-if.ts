import { DomyDirectiveHelper, DomyDirectiveReturn } from '../types/Domy';
import { getElementVisibilityHandler } from '../utils/getElementVisibilityHandler';
import { getPreviousConditionsElements } from '../utils/getPreviousConditionsElements';
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

  IsConnectedWatcher.getInstance().watch(allPreviousConditions, visibilityHandler);

  domy.effect(visibilityHandler);

  return { skipChildsRendering: true, skipOtherAttributesRendering: true };
}
