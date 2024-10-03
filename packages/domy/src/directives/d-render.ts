import { DomyDirectiveHelper, DomyDirectiveReturn } from '../types/Domy';

/**
 * d-render implementation
 * Allow to replace the current element by an other element and to render it
 * Example:
 * <div
 *   d-scope="{ count: 0, createP: () => {
 *     const p = document.createElement('p');
 *     p.textContent = 'Count: {{ count }}';
 *     return p;
 *   } }"
 * >
 *  <template d-render="createP()"></template>
 * </di>
 * @param domy
 *
 * @author yoannchb-pro
 */
export function dRenderImplementation(domy: DomyDirectiveHelper): DomyDirectiveReturn {
  const parent = domy.getRenderedElement().parentNode as Element;
  const parentChilds = Array.from(parent.childNodes);

  const el = domy.getRenderedElement();
  let transition = domy.state.transitions.get(el);

  if (el.tagName !== 'TEMPLATE')
    throw new Error(`The directive "${domy.directive}" sould only be use on template element.`);

  let lastRender: ReturnType<DomyDirectiveHelper['deepRender']> | null = null;
  let isInitialised = false;

  domy.effect(() => {
    const elementToRender: Element | null | undefined = domy.evaluate(domy.attr.value.trim());

    if (Array.isArray(elementToRender))
      throw new Error(`The directive "${domy.directive}" only support one element as parameter.`);

    // We unmount the  last render
    const disconnectAction = (currLastRender: typeof lastRender) => {
      if (currLastRender) {
        currLastRender.getRenderedElement().remove();
        currLastRender.unmount();
      }
    };

    // Handle remove transition
    if (lastRender) {
      if (transition) {
        const currentLastRender = lastRender;
        const transitionEl = lastRender.getRenderedElement();
        transitionEl.classList.remove(transition.enterTransition);
        transitionEl.classList.add(transition.outTransition);
        domy.utils.executeActionAfterAnimation(transitionEl, () =>
          disconnectAction(currentLastRender)
        );
      } else {
        disconnectAction(lastRender);
      }
    }

    // Handle the case we don't have any element to render
    if (!elementToRender) {
      if (el.isConnected) el.remove();
      return;
    }

    // We restore the element if the childrens change and it have been remove
    if (!el.isConnected) {
      const indexToInsert = domy.utils.findElementIndex(parentChilds, el);
      domy.utils.restoreElement(parent, el, indexToInsert);
    }

    // We replace the element
    el.replaceWith(elementToRender);
    domy.setRenderedElement(elementToRender);

    // Render the element
    lastRender = domy.deepRender({
      element: elementToRender,
      scopedNodeData: domy.scopedNodeData
    });

    // Handle transition
    transition = domy.state.transitions.get(lastRender.getRenderedElement());
    const needTransition = transition && (isInitialised || transition.init);
    if (needTransition) {
      const { getRenderedElement } = lastRender;
      elementToRender.classList.add(transition!.enterTransition);
      domy.utils.executeActionAfterAnimation(elementToRender, () =>
        getRenderedElement().classList.remove(transition!.enterTransition)
      );
    }

    isInitialised = true;
  });

  domy.cleanup(() => {
    if (lastRender) lastRender.unmount();
  });

  return {
    skipChildsRendering: true,
    skipComponentRendering: true,
    skipOtherAttributesRendering: true
  };
}
