import { DomyPluginHelper } from '../types/Domy';
import { restoreElement } from '../utils/restoreElement';

export function dIfImplementation(domy: DomyPluginHelper) {
  const el = domy.el;
  const parent = domy.el.parentNode as Element;
  const parentChilds = parent.childNodes;

  const transitionName = el.getAttribute('d-transition');
  const hasTransition = typeof transitionName === 'string';

  function findElementIndex(): number {
    let index = 0;
    for (const child of Array.from(parentChilds)) {
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

    initialised = true;
  });
}
