import { DomyDirectiveHelper } from '../types/Domy';

/**
 * d-html implementation
 * Allow to dynamically change the innerHTML of an element
 * @param domy
 *
 * @author yoannchb-pro
 */
export function dHtmlImplementation(domy: DomyDirectiveHelper) {
  domy.effect(() => {
    domy.block.getEl().innerHTML = domy.evaluate(domy.attr.value);
  });
}
