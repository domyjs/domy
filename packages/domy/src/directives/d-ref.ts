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
  let refName = domy.attr.value;
  let isFirstRefInit = true;

  function cleanRef() {
    if (!isFirstRefInit) delete domy.state.refs[refName];
  }
  function setRef() {
    if (domy.state.refs[refName])
      throw new Error(`A ref with the name "${refName}" already exist.`);
    updateRef();
  }
  function updateRef() {
    isFirstRefInit = false;
    domy.state.refs[refName] = domy.skipReactive(domy.block.el);
  }

  if (isDynamic) {
    domy.effect(() => {
      cleanRef();
      refName = domy.evaluate(domy.attr.value);
      setRef();
    });
  } else {
    setRef();
  }

  domy.block.onElementChange(updateRef);

  domy.cleanup(() => {
    cleanRef();
  });
}
