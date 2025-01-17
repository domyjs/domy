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
  domy.deepRender({
    element: domy.block,
    scopedNodeData: domy.scopedNodeData
  });

  // Ensure the code is started after the effects of the previous deepRender
  let isInit = false;
  const needInitTransition = domy.block.transition?.init;
  const originalDisplay = (domy.block.el as HTMLElement).style.display ?? '';

  function visibilityHandler() {
    const el = domy.block.el as HTMLElement;
    const shouldBeDisplay = domy.evaluate(domy.attr.value);
    const isAlreadyShow = el.style.display !== 'none';

    if (shouldBeDisplay && !isAlreadyShow) {
      el.style.display = originalDisplay;

      if (needInitTransition || isInit) domy.block.applyTransition('enterTransition');
    } else if (isAlreadyShow && !shouldBeDisplay) {
      if (needInitTransition || isInit) {
        domy.block.applyTransition('outTransition', () => {
          el.style.display = 'none';
        });
      } else {
        el.style.display = 'none';
      }
    }

    isInit = true;
  }

  domy.block.onElementChange(() => {
    visibilityHandler();
  });

  domy.effect(visibilityHandler);
}
