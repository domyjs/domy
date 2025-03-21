import { DomyDirectiveHelper } from '../types/Domy';

/**
 * d-transition implementation
 * Register a transition name for an element
 * It's really usefull when we render it with d-show, d-if, d-else-if, d-else, d-insert
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
      domy.block.transition = null;
      return;
    }

    const enterTransition = `${transitionName}-enter`;
    const outTransition = `${transitionName}-out`;

    domy.block.transition = {
      enterTransition,
      outTransition,
      init: domy.modifiers.includes('init')
    };
  };

  if (isDynamic) domy.effect(updateTransition);
  else updateTransition();
}
