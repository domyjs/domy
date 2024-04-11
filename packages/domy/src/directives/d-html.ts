import { DomyDirectiveHelper } from '../types/Domy';

/**
 * d-html implementation
 * @param domy
 *
 * @author yoannchb-pro
 */
export function dHtmlImplementation(domy: DomyDirectiveHelper) {
  domy.effect(() => {
    domy.el.innerHTML = domy.evaluate(domy.attr.value);
  });
}
