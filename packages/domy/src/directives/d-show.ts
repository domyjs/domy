import { DomyDirectiveHelper, DomyDirectiveReturn } from '../types/Domy';

/**
 * d-show implementation
 * It's like a d-if but the element is fully rendered and we don't remove it from the dom
 * We just hide it with a display none and show it back with the correct display
 * @param domy
 *
 * @author yoannchb-pro
 */
export function dShowImplementation(domy: DomyDirectiveHelper): DomyDirectiveReturn {
  // Ensure we deep render the element first for handling component/d-render for example
  const render = domy.deepRender({
    element: domy.el,
    scopedNodeData: domy.scopedNodeData
  });

  const el = render.getRenderedElement() as HTMLElement;
  const originalDisplay = el.style.display ?? '';

  let isInitialised = false;
  let cleanupTransition: null | (() => void) = null;

  domy.effect(() => {
    const transition = domy.state.transitions.get(el);
    const needTransition = transition && (isInitialised || transition.init);

    const shouldBeDisplay = domy.evaluate(domy.attr.value);
    const isAlreadyShow = el.style.display !== 'none';

    if (shouldBeDisplay && !isAlreadyShow) {
      if (cleanupTransition) cleanupTransition();

      // We display the element first otherwise the animation is not going to be visible
      el.style.display = originalDisplay;

      if (needTransition) {
        el.classList.add(transition.enterTransition);
        cleanupTransition = domy.utils.executeActionAfterAnimation(el, () =>
          el.classList.remove(transition.enterTransition)
        );
      }
    } else if (isAlreadyShow && !shouldBeDisplay) {
      if (needTransition) {
        if (cleanupTransition) cleanupTransition();
        el.classList.add(transition.outTransition);
        cleanupTransition = domy.utils.executeActionAfterAnimation(el, () => {
          el.classList.remove(transition.outTransition);
          el.style.display = 'none';
        });
      } else {
        el.style.display = 'none';
      }
    }

    isInitialised = true;
  });

  return {
    skipChildsRendering: true,
    skipOtherAttributesRendering: true
  };
}
