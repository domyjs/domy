import { DomyPluginHelper } from '../../types/Domy';
import { get, set } from '../../utils/getAndSet';

export function dModelImplementation(domy: DomyPluginHelper) {
  const el = domy.el as HTMLInputElement;

  const objPath = domy.attr.value.replace(/^this\./, '');

  function changeValue() {
    set(domy.state.data, objPath, el.value);
  }

  el.addEventListener('input', changeValue);
  el.addEventListener('change', changeValue);

  domy.effect(() => {
    el.value = get(domy.state.data, objPath) ?? '';
  });
}
