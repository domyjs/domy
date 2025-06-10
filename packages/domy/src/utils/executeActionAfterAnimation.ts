/**
 * Execute a function after the animation/transition on an element is finish
 * @param el
 * @param action
 * @returns
 *
 * @author yoannchb-pro
 */
export function executeActionAfterAnimation(el: Element, action: () => void) {
  const computedStyle = window.getComputedStyle(el);
  const hasAnimation = computedStyle.animationName !== 'none';
  const hasTransition = computedStyle.transitionDuration !== '0s';

  if (hasAnimation || hasTransition) {
    el.addEventListener('animationend', action, { once: true });
    el.addEventListener('transitionend', action, { once: true });
  } else {
    action();
  }

  return () => {
    el.removeEventListener('animationend', action);
    el.removeEventListener('transitionend', action);
    action();
  };
}
