import { DomyDirectiveHelper } from '../types/Domy';
import { executeActionAfterAnimation } from '../utils/executeActionAfterAnimation';

/**
 * d-show implementation
 * @param domy
 *
 * @author yoannchb-pro
 */
export function dShowImplementation(domy: DomyDirectiveHelper) {
  const el = domy.el as HTMLElement;
  const originalDisplay = el.style.display ?? '';

  let isInitialised = false;
  let cleanupTransition: null | (() => void) = null;

  domy.effect(() => {
    const transition = domy.state.transitions.get(el);

    const shouldBeDisplay = domy.evaluate(domy.attr.value);

    if (shouldBeDisplay) {
      if (cleanupTransition) cleanupTransition();

      el.style.display = originalDisplay;

      if (transition && isInitialised) {
        el.classList.remove(`${transition}-out`);
        el.classList.add(`${transition}-enter`);
      }
    } else {
      if (transition && isInitialised) {
        el.classList.remove(`${transition}-enter`);
        el.classList.add(`${transition}-out`);
        cleanupTransition = executeActionAfterAnimation(el, () => (el.style.display = 'none'));
      } else {
        el.style.display = 'none';
      }
    }

    isInitialised = true;
  });
}
