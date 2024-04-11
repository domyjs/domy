import { DomyDirectiveHelper } from '../types/Domy';
import { isBindAttr, isDomyAttr, isEventAttr } from '../utils/isSpecialAttribute';
import { binding } from './binding';
import { events } from './events';
import { PLUGINS } from './registerPlugin';

/**
 * Render a spacial attribute
 * @param domy
 *
 * @author yoannchb-pro
 */
export function renderAttribute(domy: DomyDirectiveHelper) {
  if (isBindAttr(domy.attr.name)) {
    binding(domy);
  } else if (isEventAttr(domy.attr.name)) {
    events(domy);
  } else if (isDomyAttr(domy.attr.name)) {
    for (const [directive, implementation] of Object.entries(PLUGINS.directives)) {
      if (domy.directive === directive) implementation(domy);
    }
  }
}
