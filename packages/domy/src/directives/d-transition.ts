import { DomyDirectiveHelper } from '../types/Domy';

/**
 * d-transition implementation
 * Register a transition name for an element
 * It's really usefull when we render it with d-show, d-if, d-else-if, d-else
 * @param domy
 *
 * @author yoannchb-pro
 */
export function dTransitionImplementation(domy: DomyDirectiveHelper) {
  const transitionName = domy.attr.value;
  const enterTransition = `${transitionName}-enter`;
  const outTransition = `${transitionName}-out`;
  domy.state.transitions.set(domy.el, {
    enterTransition,
    outTransition
  });
}
