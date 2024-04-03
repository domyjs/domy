import { deepRender } from '../deepRender';
import { findElementIndex } from '../../utils/findElementIndex';
import { func } from '../../utils/evaluate';
import { restoreElement } from '../../utils/restoreElement';
import { Domy, DomyProps } from '../../types/Domy';

export function dIf(domy: DomyProps) {
  const el = domy.el;

  const shouldBeDisplay = domy.utils.evaluate();

  let initialised = false;

  domy.effect(() => {
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
      const indexToInsert = findElementIndex(el.parentNode, el);

      // Handle enter transition
      if (hasTransition) el.classList.add(`${transitionName}-enter`);

      /*
      TODO:
      {
        byPassAttributes: ['d-if']
      }
      */
      domy.utils.deepRender(el);

      domy.utils.restoreElement(el.parentNode as Element, el, indexToInsert);
    }

    initialised = true;
  });
}

export function dIfPlugin(domy: Domy) {
  domy.registerAttribute('if', dIf);
}
