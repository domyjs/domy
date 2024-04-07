import { Domy, DomyProps } from '../../types/Domy';

function refImplementation(domy: DomyProps) {
  if (domy.state.refs[domy.attr.value])
    throw new Error(`A ref with the name "${domy.attr.value}" already exist.`);
  domy.state.refs[domy.attr.value] = domy.el;
}

export function refAttribute(domy: Domy) {
  domy.registerAttribute('ref', refImplementation);
}
