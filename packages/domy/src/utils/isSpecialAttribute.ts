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
 * @param attr
 * @returns
 *
 * @author yoannchb-pro
 */
export function isDomyAttr(attr: string) {
  return attr.startsWith('d-');
}

/**
 * Check if the current attribute is a normal attribute
 * @param attr
 * @returns
 *
 * @author yoannchb-pro
 */
export function isNormalAttr(attr: string) {
  return !isBindAttr(attr) && !isDomyAttr(attr) && !isEventAttr(attr);
}
