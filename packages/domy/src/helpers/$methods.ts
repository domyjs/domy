import { DomySpecialHelper } from '../types/Domy';

/**
 * Give the app methods
 * @param domy
 * @returns
 *
 * @author yoannchb-pro
 */
export function $methods(domy: DomySpecialHelper) {
  return domy.state.methods;
}
