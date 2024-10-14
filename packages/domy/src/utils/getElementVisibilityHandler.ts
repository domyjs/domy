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
  const parent = originalEl.parentNode as Element;
  const parentChilds = Array.from(parent.childNodes);

  originalEl.remove();

  function cloneOrignalEl() {
    const clone = originalEl.cloneNode(true) as Element;
    domy.block.setEl(clone);
  }

  let isInitialised = false;
  cloneOrignalEl();

  /**
   * Check if an element should be display
   * If the element should be display we render it, add it to the dom and add the corresponding transition
   * Otherwise we remove it from the dom and add the exit transition
   *
   * @author yoannchb-pro
   */
  function handleVisibility() {
    const el = domy.block.el;

    const isConnected = el.isConnected;
    const shouldBeDisplay = props.shouldBeDisplay();

    if (isConnected && !shouldBeDisplay) {
      // Remove the element and unmount it
      domy.block.remove();
      domy.block.unmount();
    } else if ((!isConnected && shouldBeDisplay) || (isConnected && !isInitialised)) {
      // If the element is not connected and we are adding it to the dom then we clone the node to create a new instance
      if (!isConnected) cloneOrignalEl();

      // Handle enter transition
      domy.block.applyTransition('enterTransition');

      // Restore the element to his original position
      const indexToInsert = props.domy.utils.findElementIndex(parentChilds, originalEl);
      domy.utils.restoreElement(parent, el, indexToInsert);

      domy.deepRender({
        element: domy.block,
        scopedNodeData: domy.scopedNodeData
      });
    }

    isInitialised = true;
  }

  domy.cleanup(() => {
    domy.block.unmount();
  });

  return handleVisibility;
}
