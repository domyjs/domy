import { DomyPluginHelper } from '../types/Domy';
import { isBindAttr, isDomyAttr, isEventAttr } from '../utils/isSpecialAttribute';
import { binding } from './binding';
import { events } from './events';
import { DIRECTIVES } from './registerPlugin';

export function renderAttribute(domy: DomyPluginHelper) {
  //   // Check if we have to bypass this attribute or not
  //   if (props.byPassAttributes && props.byPassAttributes.includes(name)) return;

  if (isBindAttr(domy.attr.name)) {
    binding(domy);
  } else if (isEventAttr(domy.attr.name)) {
    events(domy);
  } else if (isDomyAttr(domy.attr.name)) {
    for (const attr of DIRECTIVES.attributes) {
      attr(domy);
    }
  }
}
