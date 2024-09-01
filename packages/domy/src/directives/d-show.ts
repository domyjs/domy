import { DomyDirectiveHelper } from '@domyjs/types/src/Domy';
import { executeActionAfterAnimation } from '../utils/executeActionAfterAnimation';

/**
 * d-show implementation
 * It's like a d-if but the element is fully rendered and we don't remove it from the dom
 * We just hide it with a display none and show it back with the correct display
 * @param domy
 *
 * @author yoannchb-pro
 */
export function dShowImplementation(domy: DomyDirectiveHelper) {
  const el = domy.el as HTMLElement;
  const originalDisplay = el.style.display ?? '';
  const transition = domy.state.transitions.get(el);

  let isInitialised = false;
  let cleanupTransition: null | (() => void) = null;

  domy.effect(() => {
    const shouldBeDisplay = domy.evaluate(domy.attr.value);
    const isAlreadyShow = el.style.display !== 'none';

    if (shouldBeDisplay && !isAlreadyShow) {
      if (cleanupTransition) cleanupTransition();

      el.style.display = originalDisplay;

      if (transition && isInitialised) {
        el.classList.remove(`${transition}-out`);
        el.classList.add(`${transition}-enter`);
      }
    } else if (isAlreadyShow) {
      if (transition && isInitialised) {
        el.classList.remove(`${transition}-enter`);
        el.classList.add(`${transition}-out`);
        cleanupTransition = executeActionAfterAnimation(el, () => {
          el.style.display = 'none';
        });
      } else {
        el.style.display = 'none';
      }
    }

    isInitialised = true;
  });
}
