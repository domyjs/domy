import { DomyDirectiveHelper } from '../types/Domy';

/**
 * d-init implementation
 * Allow to execute some javascript/a function when an element is initialised by domy for the first time
 * Example: <div d-init="console.log('My div is rendering')">...</div>
 * @param domy
 *
 * @author yoannchb-pro
 */
export function dInitImplementation(domy: DomyDirectiveHelper) {
  const value = domy.evaluateWithoutListening(domy.attr.value);
  if (typeof value === 'function') domy.queueJob(() => value());
}
