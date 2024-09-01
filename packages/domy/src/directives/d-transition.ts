import { DomyDirectiveHelper } from '@domyjs/types/src/Domy';

/**
 * d-transition implementation
 * Register a transition name for an element
 * It's really usefull when we render it with d-show, d-if, d-else-if, d-else
 * @param domy
 *
 * @author yoannchb-pro
 */
export function dTransitionImplementation(domy: DomyDirectiveHelper) {
  domy.state.transitions.set(domy.el, domy.attr.value);
}
