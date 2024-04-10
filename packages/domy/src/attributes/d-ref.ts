import { DomyPluginHelper } from '../types/Domy';

/**
 * d-ref implementation
 * @param domy
 *
 * @author yoannchb-pro
 */
export function dRefImplementation(domy: DomyPluginHelper) {
  if (domy.state.refs[domy.attr.value])
    throw new Error(`A ref with the name "${domy.attr.value}" already exist.`);

  domy.state.refs[domy.attr.value] = domy.el;
}
