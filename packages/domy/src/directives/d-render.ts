import { Block } from '../core/Block';
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
  if (!domy.block.isTemplate())
    throw new Error(`The directive "${domy.directive}" sould only be use on template element.`);

  const parent = domy.block.el.parentNode as Element;
  const parentChilds = Array.from(parent.childNodes);

  let lastRender: Block | null = null;

  domy.effect(() => {
    const el = domy.block.el;
    const elementToRender: Element | null | undefined = domy.evaluate(domy.attr.value.trim());

    if (Array.isArray(elementToRender))
      throw new Error(`The directive "${domy.directive}" only support one element as parameter.`);

    // Handle remove transition and unmount the last render
    if (lastRender) {
      domy.block.remove();
      domy.block.unmount();
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
    domy.block.replaceWith(elementToRender);

    // Render the element
    lastRender = domy.deepRender({
      element: domy.block,
      scopedNodeData: domy.scopedNodeData
    });

    // Handle enter transition
    domy.block.applyTransition('enterTransition');
  });

  domy.cleanup(() => {
    domy.block.unmount();
  });

  return {
    skipChildsRendering: true,
    skipComponentRendering: true,
    skipOtherAttributesRendering: true
  };
}
