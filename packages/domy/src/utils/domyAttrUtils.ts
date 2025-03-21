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

/**
 * Get the name of a domy attribute/prefix
 * It will remove the domy "d-" prefix of a string
 * Otherwise it retun an empty string
 * @param attrName
 * @returns
 *
 * @author yoannchb-pro
 */
export function getDomyName(str: string) {
  return str.startsWith('d-') ? str.slice(2) : '';
}

/**
 * Retrieve some utils informations from a domy attribute
 * @param attr
 * @returns
 *
 * @author yoannchb-pro
 */
export function getDomyAttributeInformations(attr: Attr) {
  // Allow us to separate the prefix, the domy attribute name and the modifiers
  const [attrNameWithPrefix, ...modifiers] = attr.name.split('.');
  let prefix = '';
  let attrName = attrNameWithPrefix;
  if (attrName.includes(':')) {
    [prefix, attrName] = attrName.split(':');
  }

  return {
    prefix: getDomyName(prefix),
    directive: getDomyName(attrName),
    modifiers,
    attrName: attrName.replace(/^@/, '')
  };
}
