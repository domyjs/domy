import { DomyDirectiveHelper } from '../types/Domy';
import { executeActionAfterAnimation } from './executeActionAfterAnimation';
import { restoreElement } from './restoreElement';

type Props = {
  shouldBeDisplay: () => boolean;
  disconnectAction: (el: Element, unmount: (() => void) | null) => void;
  connectAction?: (el: Element) => void;
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
  const transition = domy.state.transitions.get(originalEl);

  originalEl.remove();

  let el = originalEl.cloneNode(true) as Element;
  let isInitialised = false;
  let cleanupTransition: null | (() => void) = null;
  let unmoutRender: (() => void) | null = null;

  /**
   * Check if an element should be display
   * If the element should be display we render it, add it to the dom and add the corresponding transition
   * Otherwise we remove it from the dom and add the exit transition
   *
   * @author yoannchb-pro
   */
  function handleVisibility() {
    const isConnected = el.isConnected;
    const shouldBeDisplay = props.shouldBeDisplay();

    if (isConnected && !shouldBeDisplay) {
      const disconnectAction = () => props.disconnectAction(el, unmoutRender);

      // Handle out transition
      if (transition && isInitialised) {
        if (cleanupTransition) cleanupTransition();
        el.classList.remove(transition.enterTransition);
        el.classList.add(transition.outTransition);
        cleanupTransition = executeActionAfterAnimation(el, disconnectAction);
      } else {
        disconnectAction();
      }
    } else if ((!isConnected && shouldBeDisplay) || (isConnected && !isInitialised)) {
      if (!isConnected) el = originalEl.cloneNode(true) as Element;

      // Handle enter transition
      if (transition && isInitialised) {
        if (cleanupTransition) cleanupTransition();
        el.classList.remove(transition.outTransition);
        el.classList.add(transition.enterTransition);
        cleanupTransition = executeActionAfterAnimation(el, () =>
          el.classList.remove(transition.enterTransition)
        );
      }

      domy.onClone(el, clone => {
        el = clone;
      });

      const unmount = domy.deepRender({
        element: el,
        byPassAttributes: [domy.attr.name],
        scopedNodeData: domy.scopedNodeData
      });
      unmoutRender = unmount;

      // Wait for clonage
      domy.queueJob(() => {
        const indexToInsert = props.domy.utils.findElementIndex(parentChilds, originalEl);
        restoreElement(parent, el, indexToInsert);

        props.connectAction?.(el);
      });
    }

    isInitialised = true;
  }

  domy.cleanup(() => {
    if (unmoutRender) unmoutRender();
  });

  return handleVisibility;
}
