import { DomyDirectiveHelper } from '@domyjs/types/src/Domy';

/**
 * d-ref implementation
 * Reference an element to be use later
 * @param domy
 *
 * @author yoannchb-pro
 */
export function dRefImplementation(domy: DomyDirectiveHelper) {
  if (domy.state.refs[domy.attr.value])
    throw new Error(`A ref with the name "${domy.attr.value}" already exist.`);

  domy.state.refs[domy.attr.value] = domy.el;
}
