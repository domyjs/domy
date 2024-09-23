import { DomyDirectiveHelper, DomyDirectiveReturn } from '../types/Domy';

/**
 * d-mount implementation
 * Allow to execute some javascript/a function when an element and his childrens are mounted
 * Example:
 * <div d-mount="console.log($refs.text.textContent)">
 *  <p d-ref="text">...</p>
 * </div>
 * @param domy
 *
 * @author yoannchb-pro
 */
export function dMountImplementation(domy: DomyDirectiveHelper): DomyDirectiveReturn {
  // Ensure the element with the childrens are mounted first
  const unmout = domy.deepRender({
    element: domy.el,
    byPassAttributes: [domy.attr.name],
    scopedNodeData: domy.scopedNodeData
  });

  domy.cleanup(unmout);

  const executedValue = domy.evaluateWithoutListening(domy.attr.value);
  if (typeof executedValue === 'function') domy.queueJob(() => executedValue());

  return { skipChildsRendering: true, skipOtherAttributesRendering: true };
}
