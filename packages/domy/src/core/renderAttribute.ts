import { DomyDirectiveHelper, DomyDirectiveReturn } from '../types/Domy';
import { binding } from './binding';
import { events } from './events';
import { PLUGINS } from './plugin';

/**
 * Render a special attribute
 * It can be an event, a binding, a domy attribute or a domy prefix
 * @param domy
 *
 * @author yoannchb-pro
 */
export function renderAttribute(domy: DomyDirectiveHelper): DomyDirectiveReturn {
  // Handle prefix attribute (example: d-on:click)
  if (domy.prefix.length > 0) {
    const prefixImplementation = PLUGINS.prefixes[domy.prefix];
    return prefixImplementation?.(domy);
  }

  // Handle binding attribute like :style
  if (domy.utils.isBindAttr(domy.attr.name)) {
    return binding(domy);
  }

  // Handle event attribute like @click
  if (domy.utils.isEventAttr(domy.attr.name)) {
    return events(domy);
  }

  // Handle domy attribute like d-for, d-if, ...
  // Every attributes starting by "d-"
  if (domy.utils.isDomyAttr(domy.attr.name)) {
    const directiveImplementation = PLUGINS.directives[domy.directive];
    return directiveImplementation?.(domy);
  }
}
