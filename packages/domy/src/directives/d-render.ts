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
  const fragment = new DocumentFragment();
  const elements = domy.evaluateWithoutListening(domy.attr.value);

  if (!elements) return;

  if (Array.isArray(elements)) {
    for (const element of elements) {
      fragment.appendChild(element);
    }
  } else fragment.appendChild(elements);

  for (const child of fragment.childNodes) {
    domy.deepRender({
      element: child as Element,
      scopedNodeData: domy.scopedNodeData
    });
  }

  domy.utils.replaceElement(domy.el, fragment);

  return { skipChildsRendering: true };
}
