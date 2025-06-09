/**
 * Execute a function after the animation/transition on an element is finish
 * @param el
 * @param action
 * @returns
 *
 * @author yoannchb-pro
 */
export function executeActionAfterAnimation(el: Element, action: () => void) {
  let started = false;
  const onStart = () => (started = true);

  const cleanAndStartAction = () => {
    el.removeEventListener('animationiteration', onStart);
    el.removeEventListener('animationstart', onStart);
    el.removeEventListener('transitionstart', onStart);
    el.removeEventListener('transitionrun', onStart);
    el.removeEventListener('animationend', cleanAndStartAction);
    el.removeEventListener('transitionend', cleanAndStartAction);
    action();
  };

  el.addEventListener('animationiteration', onStart, { once: true });
  el.addEventListener('animationstart', onStart, { once: true });
  el.addEventListener('transitionrun', onStart, { once: true });
  el.addEventListener('transitionstart', onStart, { once: true });

  el.addEventListener('animationend', cleanAndStartAction, { once: true });
  el.addEventListener('transitionend', cleanAndStartAction, { once: true });

  // If the animation/transition is not applying
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      if (!started) cleanAndStartAction();
    })
  );

  return cleanAndStartAction;
}
