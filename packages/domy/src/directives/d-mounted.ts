import { DomyDirectiveHelper, DomyDirectiveReturn } from '../types/Domy';

/**
 * d-mounted implementation
 * Allow to execute some javascript/a function when an element and his childrens are mounted
 * Example:
 * <div d-mounted="console.log($refs.text.textContent)">
 *  <p d-ref="text">...</p>
 * </div>
 * @param domy
 *
 * @author yoannchb-pro
 */
export function dMountedImplementation(domy: DomyDirectiveHelper): DomyDirectiveReturn {
  // Ensure the element with the childrens are mounted first
  domy.deepRender({
    element: domy.block,
    scopedNodeData: domy.scopedNodeData
  });

  const executedValue = domy.evaluate(domy.attr.value);
  if (typeof executedValue === 'function') domy.queueJob(() => executedValue());
}
