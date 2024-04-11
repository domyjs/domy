import { DomyDirectiveHelper } from '../types/Domy';
import { restoreElement } from '../utils/restoreElement';

/**
 * d-if implementation
 * @param domy
 *
 * @author yoannchb-pro
 */
export function dIfImplementation(domy: DomyDirectiveHelper) {
  const el = domy.el;
  const parent = domy.el.parentNode as Element;
  const parentChilds = Array.from(parent.childNodes);

  const transitionName = el.getAttribute('d-transition');
  const hasTransition = typeof transitionName === 'string';

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
    const shouldBeDisplay = domy.evaluate(domy.attr.value);

    if (el.isConnected && !shouldBeDisplay) {
      // Handle out transition
      if (hasTransition && initialised) {
        el.classList.remove(`${transitionName}-enter`);
        el.classList.add(`${transitionName}-out`);
        executeActionAfterAnimation(() => el.remove());
      } else {
        el.remove();
      }
    } else if (shouldBeDisplay) {
      const indexToInsert = findElementIndex();

      // Handle enter transition
      if (hasTransition) {
        el.classList.remove(`${transitionName}-out`);
        el.classList.add(`${transitionName}-enter`);
        executeActionAfterAnimation(() => el.classList.remove(`${transitionName}-enter`));
      }

      domy.deepRender({
        element: el,
        state: domy.state,
        byPassAttributes: ['d-if']
      });

      restoreElement(parent, el, indexToInsert);
    }

    // We handle d-else and d-else-if here
    // let currentIndex = parentChilds.indexOf(el);
    // let currentEl = parentChilds[parentChilds.indexOf(el)] as Element;
    // while (currentEl) {
    //   if (currentEl.nodeType === Node.TEXT_NODE) break;

    //   const isElse = currentEl.getAttribute('d-else');
    //   const isElseIf = currentEl.getAttribute('d-else-if');

    //   if (!isElse || !isElseIf) break;

    //   if (isElse) {
    //     // TODO: Handle d-else
    //     if (!shouldBeDisplay) {
    //       domy.deepRender({
    //         element: currentEl,
    //         state: domy.state
    //       });
    //     } else {
    //       currentEl.remove();
    //     }
    //   } else {
    //     // TODO: Handler d-else-if
    //   }

    //   currentEl = parentChilds[++currentIndex] as Element;
    // }
    // END

    initialised = true;
  });
}
