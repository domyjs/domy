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
  // We deep render the element first to ensure to get the correct initial style (in particular if the style is binded with :style)
  const render = domy.deepRender({
    element: domy.block,
    scopedNodeData: domy.scopedNodeData
  });

  let el = render.el as HTMLElement;
  const originalDisplay = el.style.display ?? '';

  function visibilityHandler() {
    const shouldBeDisplay = domy.evaluate(domy.attr.value);
    const isAlreadyShow = el.style.display !== 'none';

    if (shouldBeDisplay && !isAlreadyShow) {
      // We display the element first otherwise the animation is not going to be visible
      el.style.display = originalDisplay;

      domy.block.applyTransition('enterTransition');
    } else if (isAlreadyShow && !shouldBeDisplay) {
      domy.block.applyTransition('outTransition', () => {
        el.style.display = 'none';
      });
    }
  }

  domy.block.onElementChange(newEl => {
    el = newEl as HTMLElement;
    visibilityHandler();
  });

  domy.effect(visibilityHandler);
}
