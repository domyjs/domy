import { DomySpecialHelper } from '../types/Domy';

/**
 * Give the DOMY instance target provided with mount method
 * @param domy
 * @returns
 *
 * @author yoannchb-pro
 */
export function $target(domy: DomySpecialHelper) {
  return domy.state.target;
}
