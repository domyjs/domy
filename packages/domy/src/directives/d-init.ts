import { DomyDirectiveHelper } from '../types/Domy';

/**
 * d-init implementation
 * Allow to execute some javascript/a function when an element is initialised by domy
 * @param domy
 *
 * @author yoannchb-pro
 */
export function dInitImplementation(domy: DomyDirectiveHelper) {
  const value = domy.evaluateWithoutListening(domy.attr.value);
  if (typeof value === 'function') value();
}
