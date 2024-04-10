import { DomyPluginHelper } from '../types/Domy';
import { set } from '../utils/getAndSet';

/**
 * d-model implementation
 * @param domy
 *
 * @author yoannchb-pro
 */
export function dModelImplementation(domy: DomyPluginHelper) {
  const el = domy.el as HTMLInputElement;

  const objPath = domy.attr.value.replace(/^this\./, '');

  function changeValue() {
    set(domy.state.data.reactiveObj, objPath, el.value);
  }

  el.addEventListener('input', changeValue);
  el.addEventListener('change', changeValue);

  domy.effect(() => {
    el.value = domy.evaluate(domy.attr.value);
  });
}
