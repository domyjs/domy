import { DomyDirectiveHelper, DomyDirectiveReturn } from '../types/Domy';

/**
 * d-ref implementation
 * Reference an element to be use later
 * @param domy
 *
 * @author yoannchb-pro
 */
export function dRefImplementation(domy: DomyDirectiveHelper): DomyDirectiveReturn {
  const refName = domy.attr.value;

  if (domy.state.refs[domy.attr.value])
    throw new Error(`A ref with the name "${refName}" already exist.`);

  const cleanRef = () => {
    delete domy.state.refs[refName];
  };
  const setRef = (el: Element) => (domy.state.refs[refName] = el);

  // Ensure we update the ref when the element change
  const render = domy.deepRender({
    element: domy.el,
    scopedNodeData: domy.scopedNodeData,
    onRenderedElementChange(element) {
      setRef(element);
    }
  });

  setRef(render.getRenderedElement());

  domy.cleanup(cleanRef);

  return { skipChildsRendering: true, skipOtherAttributesRendering: true };
}
