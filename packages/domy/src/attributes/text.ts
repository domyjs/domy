import { DomyPluginHelper } from '../types/Domy';

export function dTextImplementation(domy: DomyPluginHelper) {
  domy.effect(() => {
    domy.el.textContent = domy.evaluate(domy.attr.value);
  });
}
