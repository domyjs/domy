/**
 * Execute a function after the animation/transition on an element is finish
 * @param el
 * @param action
 * @returns
 *
 * @author yoannchb-pro
 */
export function executeActionAfterAnimation(el: Element, action: () => void) {
  const cleanAndRunAction = () => {
    el.removeEventListener('animationend', cleanAndRunAction);
    el.removeEventListener('transitionend', cleanAndRunAction);
    action();
  };

  el.addEventListener('animationend', cleanAndRunAction, { once: true });
  el.addEventListener('transitionend', cleanAndRunAction, { once: true });

  return cleanAndRunAction;
}
