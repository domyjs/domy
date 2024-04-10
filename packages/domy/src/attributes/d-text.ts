import { DomyPluginHelper } from '../types/Domy';

/**
 * d-text implementation
 * @param domy
 *
 * @author yoannchb-pro
 */
export function dTextImplementation(domy: DomyPluginHelper) {
  domy.effect(() => {
    domy.el.textContent = domy.evaluate(domy.attr.value);
  });
}
