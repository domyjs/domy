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
  let transitionEl = domy.el;

  const updateTransition = () => {
    const transitionName = isDynamic ? domy.evaluate(domy.attr.value) : domy.attr.value;

    // If no transition is provided we remove it
    if (!transitionName) {
      domy.state.transitions.delete(transitionEl);
      return;
    }

    const enterTransition = `${transitionName}-enter`;
    const outTransition = `${transitionName}-out`;

    domy.state.transitions.set(transitionEl, {
      enterTransition,
      outTransition,
      init: domy.modifiers.includes('init')
    });
  };

  if (isDynamic) domy.effect(updateTransition);
  else updateTransition();

  domy.onRenderedElementChange(newRenderedElement => {
    domy.state.transitions.delete(transitionEl);
    transitionEl = newRenderedElement;
    updateTransition();
  });

  domy.cleanup(() => {
    domy.state.transitions.delete(transitionEl);
  });
}
