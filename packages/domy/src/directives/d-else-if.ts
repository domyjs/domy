import { DomyDirectiveHelper, DomyDirectiveReturn } from '../types/Domy';
import { executeActionAfterAnimation } from '../utils/executeActionAfterAnimation';
import { IsConnectedWatcher } from '../utils/IsConnectedWatcher';
import { restoreElement } from '../utils/restoreElement';

/**
 * d-else-if implementation
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

  const el = domy.el;
  const parent = domy.el.parentNode as Element;
  const parentChilds = Array.from(parent.childNodes);
  const transition = domy.state.transitions.get(domy.el);

  let isInitialised = false;
  let hasBeenRender = false;
  let cleanupTransition: null | (() => void) = null;

  /**
   * Find where to insert the element
   * @returns
   */
  function findElementIndex(): number {
    let index = 0;
    for (const child of parentChilds) {
      if (child === el) break;
      if (child.isConnected) ++index;
    }
    return index;
  }

  /**
   * Check if all the previous sibling are connected or not
   * If the previous sibling are all disconnected and the element should be display then we display it
   *
   * @author yoannchb-pro
   */
  function handleVisibility() {
    const isConnected = el.isConnected;
    const allPreviousConditionsAreDisconnected = !allPreviousConditions.find(el => el.isConnected);
    const shouldBeDisplay = allPreviousConditionsAreDisconnected && domy.evaluate(domy.attr.value);

    if (isConnected && !shouldBeDisplay) {
      // Handle out transition
      if (transition && isInitialised) {
        if (cleanupTransition) cleanupTransition();
        el.classList.remove(`${transition}-enter`);
        el.classList.add(`${transition}-out`);
        cleanupTransition = executeActionAfterAnimation(el, () => el.remove());
      } else {
        el.remove();
      }
    } else if (shouldBeDisplay && !isConnected) {
      const indexToInsert = findElementIndex();

      // Handle enter transition
      if (transition && isInitialised) {
        if (cleanupTransition) cleanupTransition();
        el.classList.remove(`${transition}-out`);
        el.classList.add(`${transition}-enter`);
        cleanupTransition = executeActionAfterAnimation(el, () =>
          el.classList.remove(`${transition}-enter`)
        );
      }

      if (!hasBeenRender) {
        // If it's the first time we display the element then we have to render it
        domy.deepRender({
          element: el,
          state: domy.state,
          byPassAttributes: [domy.attr.name]
        });
        hasBeenRender = true;
      }

      restoreElement(parent, el, indexToInsert);
    }

    isInitialised = true;
  }

  IsConnectedWatcher.getInstance().watch(allPreviousConditions, handleVisibility);

  domy.effect(handleVisibility);

  return { skipChildsRendering: true, skipOtherAttributesRendering: true };
}
