import { DomyDirectiveHelper, DomyDirectiveReturn } from '../types/Domy';

/**
 * d-ref implementation
 * Reference an element to be use later
 * @param domy
 *
 * @author yoannchb-pro
 */
export function dRefImplementation(domy: DomyDirectiveHelper): DomyDirectiveReturn {
  const isDynamic = domy.modifiers.includes('dynamic');
  let refName = isDynamic ? domy.evaluateWithoutListening(domy.attr.value) : domy.attr.value;

  if (domy.state.refs[domy.attr.value])
    throw new Error(`A ref with the name "${refName}" already exist.`);

  const cleanRef = () => {
    delete domy.state.refs[refName];
  };
  const setRef = (el: Element) => (domy.state.refs[refName] = el);

  // If the ref is dynamic
  if (domy.modifiers.includes('dynamic')) {
    domy.effect(() => {
      cleanRef();
      refName = domy.evaluate(domy.attr.value);
      setRef(domy.getRenderedElement());
    });
  }

  // If the element change we ensure to update the ref
  domy.onRenderedElementChange(newRenderedElement => {
    cleanRef();
    setRef(newRenderedElement);
  });

  // Set the initial ref
  setRef(domy.getRenderedElement());

  domy.cleanup(() => {
    cleanRef();
  });
}
