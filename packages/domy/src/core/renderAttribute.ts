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
  // Handle prefix attribute (example: d-on:click)
  if (domy.prefix.length > 0) {
    for (const [prefix, implementation] of Object.entries(PLUGINS.prefixes)) {
      if (domy.prefix === prefix) return implementation(domy);
    }
    return;
  }

  if (isBindAttr(domy.attr.name)) {
    // Handle binding attribute like :style
    return binding(domy);
  } else if (isEventAttr(domy.attr.name)) {
    // Handle event attribute like @click
    return events(domy);
  } else if (isDomyAttr(domy.attr.name)) {
    // Handle domy attribute like d-for
    for (const [directive, implementation] of Object.entries(PLUGINS.directives)) {
      if (domy.directive === directive) return implementation(domy);
    }
  }
}
