import { DomyPluginHelper } from '../types/Domy';
import { isBindAttr, isDomyAttr, isEventAttr } from '../utils/isSpecialAttribute';
import { binding } from './binding';
import { events } from './events';
import { DIRECTIVES } from './registerPlugin';

/**
 * Render a spacial attribute
 * @param domy
 *
 * @author yoannchb-pro
 */
export function renderAttribute(domy: DomyPluginHelper) {
  if (isBindAttr(domy.attr.name)) {
    binding(domy);
  } else if (isEventAttr(domy.attr.name)) {
    events(domy);
  } else if (isDomyAttr(domy.attr.name)) {
    for (const [directive, implementation] of Object.entries(DIRECTIVES.attributes)) {
      if (domy.directive === directive) implementation(domy);
    }
  }
}
