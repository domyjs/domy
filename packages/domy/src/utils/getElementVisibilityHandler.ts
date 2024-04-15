import { DomyDirectiveHelper } from '../types/Domy';
import { executeActionAfterAnimation } from './executeActionAfterAnimation';
import { restoreElement } from './restoreElement';

type GetShouldBeDisplay = () => boolean;

/**
 * Logic for d-if, d-else-if and d-else
 * @param shouldBeDisplayCallback
 * @param domy
 * @returns
 *
 * @author yoannchb-pro
 */
export function getElementVisibilityHandler(
  shouldBeDisplayCallback: GetShouldBeDisplay,
  domy: DomyDirectiveHelper
) {
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
   * Check if an element should be display
   * If the element should be display we render it, add it to the dom and add the corresponding transition
   * Otherwise we remove it from the dom and add the exit transition
   *
   * @author yoannchb-pro
   */
  function handleVisibility() {
    const isConnected = el.isConnected;
    const shouldBeDisplay = shouldBeDisplayCallback();

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
    } else if (!isConnected && shouldBeDisplay) {
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

  return handleVisibility;
}
