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

  function findElementIndex(): number {
    let index = 0;
    for (const child of parentChilds) {
      if (child === el) break;
      if (child.isConnected) ++index;
    }
    return index;
  }

  function executeActionAfterAnimation(action: () => void) {
    const actionAfterAnimation: EventListenerOrEventListenerObject = () => {
      action();
    };

    el.addEventListener('animationend', actionAfterAnimation, { once: true });
    el.addEventListener('transition', actionAfterAnimation, { once: true });
  }

  let initialised = false;

  domy.effect(() => {
    const transition = domy.state.transitions.get(domy.el);

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

      // Handle enter transition
      if (transition) {
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
