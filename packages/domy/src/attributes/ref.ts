import { DomyPluginHelper } from '../types/Domy';

export function dRefImplementation(domy: DomyPluginHelper) {
  if (domy.state.refs[domy.attr.value])
    throw new Error(`A ref with the name "${domy.attr.value}" already exist.`);

  domy.state.refs[domy.attr.value] = domy.el;
}
