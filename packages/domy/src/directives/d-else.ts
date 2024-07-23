import { DomyDirectiveHelper, DomyDirectiveReturn } from '../types/Domy';
import { getElementVisibilityHandler } from '../utils/getElementVisibilityHandler';
import { getPreviousConditionsElements } from '../utils/getPreviousConditionsElements';
import { IsConnectedWatcher } from '../utils/IsConnectedWatcher';

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

  const visiblityHandler = getElementVisibilityHandler({
    shouldBeDisplay: () => {
      const allPreviousConditionsAreDisconnected = !allPreviousConditions.find(
        el => el.isConnected
      );
      return allPreviousConditionsAreDisconnected;
    },
    domy
  });

  IsConnectedWatcher.getInstance().watch(allPreviousConditions, visiblityHandler);

  visiblityHandler();

  return { skipChildsRendering: true, skipOtherAttributesRendering: true };
}
