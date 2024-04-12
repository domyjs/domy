import { DomyDirectiveHelper, DomyDirectiveReturn } from '../types/Domy';
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
   * Execute a function after the animation on an element is finish
   * @param action
   */
  function executeActionAfterAnimation(action: () => void) {
    const actionAfterAnimation: EventListenerOrEventListenerObject = () => {
      action();
    };

    el.addEventListener('animationend', actionAfterAnimation, { once: true });
    el.addEventListener('transition', actionAfterAnimation, { once: true });
  }

  // Check if the element is already initialised to avoid making a useless transition at first
  let initialised = false;

  domy.effect(() => {
    let transition: string | undefined | null = domy.state.transitions.get(domy.el);

    const shouldBeDisplay = domy.evaluate(domy.attr.value);

    if (el.isConnected && !shouldBeDisplay) {
      // Handle out transition
      if (transition && initialised) {
        el.classList.remove(`${transition}-enter`);
        el.classList.add(`${transition}-out`);
        executeActionAfterAnimation(() => el.remove());
      } else {
        el.remove();
      }
    } else if (shouldBeDisplay) {
      const indexToInsert = findElementIndex();

      // because we skip other attributes rendering sometimes d-if don't know it have a transition
      // so here we do a check
      if (!transition) transition = el.getAttribute('d-transition');

      // Handle enter transition
      if (transition && initialised) {
        el.classList.remove(`${transition}-out`);
        el.classList.add(`${transition}-enter`);
        executeActionAfterAnimation(() => el.classList.remove(`${transition}-enter`));
      }

      domy.deepRender({
        element: el,
        state: domy.state,
        byPassAttributes: ['d-if']
      });

      restoreElement(parent, el, indexToInsert);
    }

    initialised = true;
  });

  return { skipChildsRendering: true, skipOtherAttributesRendering: true };
}
