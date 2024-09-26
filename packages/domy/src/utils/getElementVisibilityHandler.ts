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

  let currentEl = originalEl.cloneNode(true) as Element;
  domy.setEl(currentEl);

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
    const transition = domy.state.transitions.get(originalEl);
    const el = lastRender ? lastRender.getRenderedElement() : currentEl;
    const isConnected = el.isConnected;
    const shouldBeDisplay = props.shouldBeDisplay();

    if (isConnected && !shouldBeDisplay) {
      const disconnectAction = () => {
        el.remove();
        if (lastRender) lastRender.unmount();
      };

      // Handle out transition
      if (transition && isInitialised) {
        if (cleanupTransition) cleanupTransition();
        el.classList.remove(transition.enterTransition);
        el.classList.add(transition.outTransition);
        cleanupTransition = domy.utils.executeActionAfterAnimation(el, disconnectAction);
      } else {
        disconnectAction();
      }
    } else if ((!isConnected && shouldBeDisplay) || (isConnected && !isInitialised)) {
      if (!isConnected) {
        currentEl = originalEl.cloneNode(true) as Element;
        domy.setEl(currentEl);
      }

      // Handle enter transition
      if (transition && isInitialised) {
        if (cleanupTransition) cleanupTransition();
        currentEl.classList.remove(transition.outTransition);
        currentEl.classList.add(transition.enterTransition);
        cleanupTransition = domy.utils.executeActionAfterAnimation(currentEl, () =>
          currentEl.classList.remove(transition.enterTransition)
        );
      }

      const indexToInsert = props.domy.utils.findElementIndex(parentChilds, originalEl);
      domy.utils.restoreElement(parent, currentEl, indexToInsert);

      lastRender = domy.deepRender({
        element: currentEl,
        byPassAttributes: [domy.attr.name],
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
