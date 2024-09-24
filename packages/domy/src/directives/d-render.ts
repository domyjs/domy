import { DomyDirectiveHelper, DomyDirectiveReturn } from '../types/Domy';

/**
 * d-render implementation
 * Allow to replace the current element by one or many elements
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

  const originalEl = domy.el;

  const lastRenders: ReturnType<DomyDirectiveHelper['deepRender']>[] = [];

  domy.effect(() => {
    const elements: Element[] = [domy.evaluate(domy.attr.value)]
      .flat()
      .filter(element => !!element);

    // We unmount the elements and we remove them
    for (const { getRenderedElement, unmount } of lastRenders) {
      unmount();
      getRenderedElement().remove();
    }
    lastRenders.length = 0;

    // Handle the case we don't have any element(s) to render
    if (elements.length === 0) {
      if (originalEl.isConnected) originalEl.remove();
      return;
    }

    // We restore the element if the childrens change and it have been remove
    if (!originalEl.isConnected) {
      const indexToInsert = domy.utils.findElementIndex(parentChilds, originalEl);
      domy.utils.restoreElement(parent, originalEl, indexToInsert);
    }

    // We replace the element
    originalEl.replaceWith(...elements);

    // Render the childs
    for (let i = 0; i < elements.length; ++i) {
      const element = elements[i];
      const render = domy.deepRender({
        element,
        scopedNodeData: domy.scopedNodeData
      });
      lastRenders.push(render);
    }
  });

  domy.cleanup(() => {
    for (const { unmount } of lastRenders) {
      unmount();
    }
  });

  return { skipChildsRendering: true };
}
