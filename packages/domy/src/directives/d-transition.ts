import { DomyDirectiveHelper } from '../types/Domy';

/**
 * d-transition implementation
 * @param domy
 *
 * @author yoannchb-pro
 */
export function dTransitionImplementation(domy: DomyDirectiveHelper) {
  domy.state.transitions.set(domy.el, domy.attr.value);
}
