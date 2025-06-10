/**
 * Execute a function after the animation/transition on an element is finish
 * @param el
 * @param action
 * @returns
 *
 * @author yoannchb-pro
 */
export function executeActionAfterAnimation(el: Element, action: () => void) {
  const actionAfterAnimation = () => {
    action();
  };

  el.addEventListener('animationend', actionAfterAnimation, { once: true });
  el.addEventListener('transitionend', actionAfterAnimation, { once: true });

  return () => {
    el.removeEventListener('animationend', actionAfterAnimation);
    el.removeEventListener('transitionend', actionAfterAnimation);
    actionAfterAnimation();
  };
}
