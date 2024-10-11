import { DomyDirectiveHelper, DomyDirectiveReturn } from '../types/Domy';

/**
 * d-key implementation
 * Allow to keep track of change into an array
 * It have to be combined with d-for
 * Example:
 * <ul d-for="element of array">
 *  <li d-key="element.id">...</li>
 * </ul>
 * @param domy
 *
 * @author yoannchb-pro
 */
export function dKeyImplementation(domy: DomyDirectiveHelper): DomyDirectiveReturn {
  const registeredKey: { key: string; element: Element } = {
    key: domy.evaluateWithoutListening(domy.attr.value),
    element: domy.el
  };

  // Add the key to the state
  domy.state.keys.push(registeredKey);

  // React to elemment change
  domy.onRenderedElementChange(newEl => {
    registeredKey.element = newEl;
  });

  domy.effect(() => {
    const key = domy.evaluate(domy.attr.value);
    registeredKey.key = key;
  });

  domy.cleanup(() => {
    const index = domy.state.keys.indexOf(registeredKey);
    domy.state.keys.splice(index, 1);
  });
}
