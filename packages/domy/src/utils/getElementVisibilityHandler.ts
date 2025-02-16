import { Block } from '../core/Block';
import { DomyDirectiveHelper } from '../types/Domy';

type Props = {
  shouldBeDisplay: () => boolean;
  domy: DomyDirectiveHelper;
};

/**
 * Handle the visibility of an element with the transition
 * @param props
 * @returns
 *
 * @author yoannchb-pro
 */
export function getElementVisibilityHandler(props: Props) {
  const domy = props.domy;
  const originalEl = domy.block.el;

  const tracePositionComment = new Comment('d-if position tracking, do not remove');
  originalEl.before(tracePositionComment);
  originalEl.remove();

  let lastRender: Block = domy.block;
  let isInit = false;

  /**
   * Check if an element should be display
   * If the element should be display we render it, add it to the dom and add the corresponding transition
   * Otherwise we remove it from the dom and add the exit transition
   *
   * @author yoannchb-pro
   */
  function handleVisibility() {
    const isConnected = lastRender.el.isConnected;
    const shouldBeDisplay = props.shouldBeDisplay();

    if (isConnected && !shouldBeDisplay) {
      // Remove the element and unmount it
      lastRender.transition = domy.block.transition;
      lastRender.remove();
      lastRender.unmount();
    } else if (!isConnected && shouldBeDisplay) {
      const clone = originalEl.cloneNode(true) as Element;

      // Restore the element to his original position
      tracePositionComment.before(clone);

      // Render the clone and create a new block
      lastRender = domy.deepRender({
        element: clone,
        scopedNodeData: domy.scopedNodeData
      });

      // Replace the current block with the new rendered block
      domy.block.setEl(lastRender);

      // Handle enter transition
      // Need to be apply after the block know the new element
      if (domy.block.transition?.init || isInit) domy.block.applyTransition('enterTransition');
    }

    isInit = true;
  }

  return {
    effect: handleVisibility,
    cleanup: () => {
      tracePositionComment.remove();
    }
  };
}
