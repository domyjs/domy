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
  const refName = isDynamic ? domy.evaluate(domy.attr.value) : domy.attr.value;

  const cleanRef = () => {
    delete domy.state.refs[refName];
  };
  const setRef = () => {
    if (domy.state.refs[refName])
      throw new Error(`A ref with the name "${refName}" already exist.`);
    updateRef();
  };
  const updateRef = () => {
    domy.state.refs[refName] = domy.skipReactive(domy.block.el);
  };

  setRef();
  domy.block.onElementChange(updateRef);

  domy.cleanup(() => {
    cleanRef();
  });
}
