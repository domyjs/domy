/**
 * Execute a function after the animation/transition on an element is finish
 * @param el
 * @param action
 * @returns
 */
export function executeActionAfterAnimation(el: Element, action: () => void) {
  let started = false;

  const onStart = () => (started = true);
  const onEnd = () => {
    cleanup();
    action();
  };

  const cleanup = () => {
    el.removeEventListener('animationstart', onStart);
    el.removeEventListener('transitionstart', onStart);
    el.removeEventListener('animationend', onEnd);
    el.removeEventListener('transitionend', onEnd);
  };

  el.addEventListener('animationstart', onStart);
  el.addEventListener('transitionstart', onStart);

  el.addEventListener('animationend', onEnd, { once: true });
  el.addEventListener('transitionend', onEnd, { once: true });

  // If no animation as started
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (!started) onEnd();
    });
  });

  return cleanup;
}
