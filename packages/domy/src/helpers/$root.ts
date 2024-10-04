import { DomySpecialHelper } from '../types/Domy';

/**
 * Give the current parent of the element
 * @param domy
 * @returns
 *
 * @author yoannchb-pro
 */
export function $root(domy: DomySpecialHelper) {
  return domy.el?.nodeType === Node.TEXT_NODE
    ? domy.el?.parentNode?.parentNode
    : domy.el?.parentNode;
}
