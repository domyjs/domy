import { DomyPluginHelper } from '../types/Domy';

export function dHtmlImplementation(domy: DomyPluginHelper) {
  domy.effect(() => {
    domy.el.innerHTML = domy.evaluate(domy.attr.value);
  });
}
