import { Plugins } from '../core/plugin';

/**
 * Check if the current attribute is a binding attribute
 * @param attr
 * @returns
 *
 * @author yoannchb-pro
 */
export function isBindAttr(attr: string) {
  return attr.startsWith(':') || attr.startsWith('d-bind:');
}

/**
 * Check if the current attribute is an event attribute
 * @param attr
 * @returns
 *
 * @author yoannchb-pro
 */
export function isEventAttr(attr: string) {
  return attr.startsWith('@') || attr.startsWith('d-on:');
}

/**
 * Check if the current attribute is a domy attribute
 * It could be a prefix like d-on:click
 * Or it could be a simple attribute like d-for
 * @param attr
 * @returns
 *
 * @author yoannchb-pro
 */
export function isDomyAttr(PLUGINS: Plugins, attr: string) {
  const [attrName] = attr.split(/[.:]/gi);

  if (!attrName.startsWith('d-')) return false;

  const attrNameWithoutDPrefix = attrName.slice(2);

  if (attrNameWithoutDPrefix in PLUGINS.directives || attrNameWithoutDPrefix in PLUGINS.prefixes) {
    return true;
  }

  return false;
}

/**
 * Check if the current attribute is a normal attribute
 * @param attr
 * @returns
 *
 * @author yoannchb-pro
 */
export function isNormalAttr(PLUGINS: Plugins, attr: string) {
  return !isBindAttr(attr) && !isDomyAttr(PLUGINS, attr) && !isEventAttr(attr);
}
