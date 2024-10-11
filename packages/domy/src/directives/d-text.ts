import { DomyDirectiveHelper } from '../types/Domy';

/**
 * d-text implementation
 * Allow to dynamically change the textContent of an element
 * It's really usefull in case we use a templating langage like mustache.js which also use {{ expression }}
 * @param domy
 *
 * @author yoannchb-pro
 */
export function dTextImplementation(domy: DomyDirectiveHelper) {
  domy.effect(() => {
    domy.el.textContent = domy.evaluate(domy.attr.value);
  });
}
