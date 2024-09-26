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
  const parent = domy.el.parentNode as Element;
  const parentChilds = Array.from(parent.childNodes);

  const el = domy.el;

  let lastRender: ReturnType<DomyDirectiveHelper['deepRender']> | null = null;

  domy.effect(() => {
    const elementToRender: Element | null | undefined = domy.evaluate(domy.attr.value.trim());

    if (Array.isArray(elementToRender))
      throw new Error(`The directive "d-render" only support one element as parameter.`);

    // We unmount the  last render
    if (lastRender) {
      lastRender.getRenderedElement().remove();
      lastRender.unmount();
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
    domy.setEl(elementToRender);

    // Render the element
    lastRender = domy.deepRender({
      element: elementToRender,
      scopedNodeData: domy.scopedNodeData
    });
  });

  domy.cleanup(() => {
    if (lastRender) lastRender.unmount();
  });

  return { skipChildsRendering: true };
}
