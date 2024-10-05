/**
 * Fixe an attribute name to avoid setAttribute throwing error
 * @param attrName
 * @returns
 *
 * @author yoannchb-pro
 */
export function fixeAttrName(attrName: string) {
  return attrName.replace(/^@/, 'd-on:').replace(/^:/, 'd-bind:');
}
