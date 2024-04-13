import { DomyDirectiveHelper, DomyDirectiveReturn } from '../types/Domy';
import { executeActionAfterAnimation } from '../utils/executeActionAfterAnimation';
import { restoreElement } from '../utils/restoreElement';

/**
 * d-if implementation
 * @param domy
 *
 * @author yoannchb-pro
 */
export function dIfImplementation(domy: DomyDirectiveHelper): DomyDirectiveReturn {
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

  domy.effect(() => {
    const shouldBeDisplay = domy.evaluate(domy.attr.value);

    if (el.isConnected && !shouldBeDisplay) {
      // Handle out transition
      if (transition && isInitialised) {
        if (cleanupTransition) cleanupTransition();
        el.classList.remove(`${transition}-enter`);
        el.classList.add(`${transition}-out`);
        cleanupTransition = executeActionAfterAnimation(el, () => el.remove());
      } else {
        el.remove();
      }
    } else if (shouldBeDisplay) {
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
          byPassAttributes: ['d-if']
        });
        hasBeenRender = true;
      }

      restoreElement(parent, el, indexToInsert);
    }

    isInitialised = true;
  });

  return { skipChildsRendering: true, skipOtherAttributesRendering: true };
}
