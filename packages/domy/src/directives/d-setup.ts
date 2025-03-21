import { DomyDirectiveHelper } from '../types/Domy';

/**
 * d-setup implementation
 * Allow to execute some javascript/a function when an element is initialised by domy for the first time
 * Example: <div d-setup="console.log('My div is rendering')">...</div>
 * @param domy
 *
 * @author yoannchb-pro
 */
export function dSetupImplementation(domy: DomyDirectiveHelper) {
  const executedValue = domy.evaluate(domy.attr.value);
  if (typeof executedValue === 'function') executedValue();
}
