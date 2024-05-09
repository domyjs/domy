/**
 * Execute a function after the animation/transition on an element is finish
 * @param el
 * @param action
 * @returns
 */
export function executeActionAfterAnimation(el: Element, action: () => void) {
  const actionAfterAnimation: EventListenerOrEventListenerObject = () => {
    action();
  };

  el.addEventListener('animationend', actionAfterAnimation, { once: true });
  el.addEventListener('transition', actionAfterAnimation, { once: true });

  return () => {
    el.removeEventListener('animationend', actionAfterAnimation);
    el.removeEventListener('transition', actionAfterAnimation);
  };
}
