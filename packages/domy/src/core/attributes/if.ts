import { DomyPluginHelper } from '../../types/Domy';
import { restoreElement } from '../../utils/restoreElement';

export function dIfImplementation(domy: DomyPluginHelper) {
  const el = domy.el;
  const parent = domy.el.parentNode as Element;
  const parentChilds = parent.childNodes;

  let initialised = false;

  function findElementIndex(): number {
    let index = 0;
    for (const child of Array.from(parentChilds)) {
      if (child === el) break;
      if (child.isConnected) ++index;
    }
    return index;
  }

  domy.effect(() => {
    const shouldBeDisplay = domy.evaluate(domy.attr.value);

    const transitionName = el.getAttribute('d-transition');
    const hasTransition = typeof transitionName === 'string';

    const transitionOutListener: EventListenerOrEventListenerObject = () => {
      el.remove();
      el.removeEventListener('transitionend', transitionOutListener);
      el.removeEventListener('animationend', transitionOutListener);
    };

    if (el.isConnected && !shouldBeDisplay) {
      // Handle out transition
      if (hasTransition && initialised) {
        el.classList.add(`${transitionName}-out`);
        el.addEventListener('animationend', transitionOutListener);
        el.addEventListener('transition', transitionOutListener);
      } else {
        el.remove();
      }
    } else if (shouldBeDisplay) {
      const indexToInsert = findElementIndex();

      // Handle enter transition
      if (hasTransition) el.classList.add(`${transitionName}-enter`);

      /*
      TODO:
      {
        byPassAttributes: ['d-if']
      }
      */
      domy.deepRender({
        element: el,
        state: domy.state
      });

      restoreElement(parent, el, indexToInsert);
    }

    initialised = true;
  });
}
