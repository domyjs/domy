import { DomyDirectiveHelper } from '../types/Domy';

/**
 * d-transition implementation
 * Register a transition name for an element
 * It's really usefull when we render it with d-show, d-if, d-else-if, d-else, d-render
 * @param domy
 *
 * @author yoannchb-pro
 */
export function dTransitionImplementation(domy: DomyDirectiveHelper) {
  const isDynamic = domy.modifiers.includes('dynamic');

  const updateTransition = () => {
    const transitionName = isDynamic ? domy.evaluate(domy.attr.value) : domy.attr.value;

    // If no transition is provided we remove it
    if (!transitionName) {
      domy.state.transitions.delete(domy.el);
      return;
    }

    const enterTransition = `${transitionName}-enter`;
    const outTransition = `${transitionName}-out`;

    domy.state.transitions.set(domy.el, {
      enterTransition,
      outTransition,
      init: domy.modifiers.includes('init')
    });
  };

  if (isDynamic) domy.effect(updateTransition);
  else updateTransition();

  domy.cleanup(() => {
    domy.state.transitions.delete(domy.el);
  });
}
