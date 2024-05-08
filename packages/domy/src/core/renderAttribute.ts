import { DomyDirectiveHelper, DomyDirectiveReturn } from '../types/Domy';
import { isBindAttr, isDomyAttr, isEventAttr } from '../utils/isSpecialAttribute';
import { binding } from './binding';
import { events } from './events';
import { PLUGINS } from './plugin';

/**
 * Render a special attribute
 * It can be an event, a binding or a domy attribute
 * @param domy
 *
 * @author yoannchb-pro
 */
export function renderAttribute(domy: DomyDirectiveHelper): DomyDirectiveReturn {
  if (isBindAttr(domy.attr.name)) {
    return binding(domy);
  } else if (isEventAttr(domy.attr.name)) {
    return events(domy);
  } else if (isDomyAttr(domy.attr.name)) {
    for (const [directive, implementation] of Object.entries(PLUGINS.directives)) {
      if (domy.directive === directive) return implementation(domy);
    }
  }
}
