import { DomyDirectiveHelper, DomyDirectiveReturn } from '../types/Domy';

function cleanup(unmountFns: (() => void)[]) {
  for (const unmountFn of unmountFns) {
    unmountFn();
  }
}

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

  let el = domy.el;
  let hasBeenRemove = false;
  let lastRenderedChilds: Element[] = [];
  const unmountFns: (() => void)[] = [];

  domy.effect(() => {
    const fragment = new DocumentFragment();
    const elements = domy.evaluate(domy.attr.value);
    const isArray = Array.isArray(elements);

    // We unmount the elements before removing them
    cleanup(unmountFns);
    unmountFns.length = 0;

    // Handle the case we don't have any element(s) to render
    if (!elements || (isArray && elements.length === 0)) {
      el.remove();
      hasBeenRemove = true;
      return;
    }

    // Append the child(s) to the fragment
    if (isArray) {
      for (const element of elements) {
        fragment.appendChild(element);
      }
    } else fragment.appendChild(elements);

    // Render the childs
    for (let i = 0; i < fragment.childNodes.length; ++i) {
      const child = fragment.childNodes[i] as Element;
      const { unmount, renderedElement } = domy.deepRender({
        element: child,
        scopedNodeData: domy.scopedNodeData
      });
      unmountFns.push(unmount);
      child.replaceWith(renderedElement);
    }

    // We restore the element if the childrens change and it have been remove
    if (hasBeenRemove) {
      const indexToInsert = domy.utils.findElementIndex(parentChilds, originalEl);
      domy.utils.restoreElement(parent, el, indexToInsert);
      hasBeenRemove = false;
    }

    // Copy the fragment child before adding them to the dom because the fragment don't keep them
    const childsToRender = Array.from(fragment.childNodes) as Element[];

    el.replaceWith(fragment);

    // We remove the last rendered childs
    for (const element of lastRenderedChilds) {
      element.remove();
    }
    el = childsToRender[0]; // We will replace the first rendered children with the next render
    lastRenderedChilds = childsToRender;
  });

  domy.cleanup(() => cleanup(unmountFns));

  return { skipChildsRendering: true };
}
