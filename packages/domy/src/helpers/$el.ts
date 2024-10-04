import { DomySpecialHelper } from '../types/Domy';

/**
 * Give the current element
 * @param domy
 * @returns
 *
 * @author yoannchb-pro
 */
export function $el(domy: DomySpecialHelper) {
  return domy.el?.nodeType === Node.TEXT_NODE ? domy.el.parentNode : domy.el;
}
