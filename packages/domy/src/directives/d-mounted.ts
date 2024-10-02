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
  const { unmount } = domy.deepRender({
    element: domy.el,
    scopedNodeData: domy.scopedNodeData
  });

  domy.cleanup(unmount);

  const executedValue = domy.evaluateWithoutListening(domy.attr.value);
  if (typeof executedValue === 'function') domy.queueJob(() => executedValue());

  return {
    skipChildsRendering: true,
    skipOtherAttributesRendering: true,
    skipComponentRendering: true
  };
}
