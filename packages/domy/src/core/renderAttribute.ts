import { DomyPluginHelper } from '../types/Domy';
import { isBindAttr, isDomyAttr, isEventAttr } from '../utils/isSpecialAttribute';
import { binding } from './binding';
import { domies } from './domies';
import { events } from './events';

export function renderAttribute(domy: DomyPluginHelper) {
  //   // Check if we have to bypass this attribute or not
  //   if (props.byPassAttributes && props.byPassAttributes.includes(name)) return;

  if (isBindAttr(domy.attr.name)) {
    binding(domy);
  } else if (isEventAttr(domy.attr.name)) {
    events(domy);
  } else if (isDomyAttr(domy.attr.name)) {
    domies(domy);
  }
}
