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
  const originalEl = domy.el;
  const parent = originalEl.parentNode as Element;
  const parentChilds = Array.from(parent.childNodes);

  originalEl.remove();

  // Clone the original element and let domy know the new element
  function clone() {
    const clone = originalEl.cloneNode(true) as Element;
    domy.setRenderedElement(clone);
    return clone;
  }

  let currentEl = clone();
  let isInitialised = false;
  let cleanupTransition: null | (() => void) = null;
  let lastRender: ReturnType<DomyDirectiveHelper['deepRender']> | null = null;

  /**
   * Check if an element should be display
   * If the element should be display we render it, add it to the dom and add the corresponding transition
   * Otherwise we remove it from the dom and add the exit transition
   *
   * @author yoannchb-pro
   */
  function handleVisibility() {
    const el = lastRender ? lastRender.getRenderedElement() : currentEl;

    const transition = domy.state.transitions.get(el);
    const needTransition = transition && (isInitialised || transition.init);

    const isConnected = el.isConnected;
    const shouldBeDisplay = props.shouldBeDisplay();

    if (isConnected && !shouldBeDisplay) {
      // Remove the element and unmount it
      const disconnectAction = () => {
        el.remove();
        if (lastRender) lastRender.unmount();
      };

      // Handle out transition
      if (needTransition) {
        if (cleanupTransition) cleanupTransition();
        el.classList.add(transition.outTransition);
        cleanupTransition = domy.utils.executeActionAfterAnimation(el, () => {
          el.classList.remove(transition.outTransition);
          disconnectAction();
        });
      } else {
        disconnectAction();
      }
    } else if ((!isConnected && shouldBeDisplay) || (isConnected && !isInitialised)) {
      // If the element is not connected and we are adding it to the dom then we clone the node to create a new instance
      if (!isConnected) currentEl = clone();

      // Handle enter transition
      if (needTransition) {
        if (cleanupTransition) cleanupTransition();
        currentEl.classList.add(transition.enterTransition);
        cleanupTransition = domy.utils.executeActionAfterAnimation(currentEl, () =>
          currentEl.classList.remove(transition.enterTransition)
        );
      }

      // Restore the element to his original position
      const indexToInsert = props.domy.utils.findElementIndex(parentChilds, originalEl);
      domy.utils.restoreElement(parent, currentEl, indexToInsert);

      lastRender = domy.deepRender({
        element: currentEl,
        scopedNodeData: domy.scopedNodeData
      });
    }

    isInitialised = true;
  }

  domy.cleanup(() => {
    if (lastRender) lastRender.unmount();
  });

  return handleVisibility;
}
