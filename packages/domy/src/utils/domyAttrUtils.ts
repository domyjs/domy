import { PLUGINS } from '../core/plugin';

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

/**
 * Sort a list of attributes based on the sorted directives order in plugin
 * It ensure some attributes are rendered first like d-ignore, d-once, ...
 * @param attrs
 * @returns
 *
 * @author yoannchb-pro
 */
export function sortAttributesBasedOnSortedDirectives(attrs: NamedNodeMap) {
  const copy = Array.from(attrs ?? []);
  copy.sort((a, b) => {
    const iA = PLUGINS.sortedDirectives.indexOf(getDomyName(a.name));
    const iB = PLUGINS.sortedDirectives.indexOf(getDomyName(b.name));
    if (iA === -1) {
      return 1;
    } else if (iB === -1) {
      return -1;
    } else {
      return iA - iB;
    }
  });
  return copy;
}
