import { DomyPluginHelper } from '../types/Domy';
import { set } from '../utils/getAndSet';

type Value = string | number | boolean | string[] | undefined;

/**
 * d-model implementation
 * @param domy
 *
 * @author yoannchb-pro
 */
export function dModelImplementation(domy: DomyPluginHelper) {
  const el = domy.el as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
  const objPath = domy.attr.value.replace(/^this\./, '');

  function changeValue() {
    let value: Value = el.value;

    if (el.tagName === 'SELECT') {
      // Select handling
      const selectEl = el as HTMLSelectElement;
      const isMultiple = selectEl.multiple;
      const selectedOptions = selectEl.selectedOptions;

      if (isMultiple) {
        value = [];
        for (const selectedOption of selectedOptions) {
          value.push(selectedOption.value);
        }
      } else {
        value = selectedOptions[0]?.value ?? '';
      }
    } else if ((el.type === 'number' || domy.modifiers.includes('number')) && value) {
      // Number handling
      value = Number(value);
    } else if (el.type === 'radio') {
      // Radio handling
      if ((el as HTMLInputElement).checked) value = el.value;
    } else if (el.type === 'checkbox') {
      // TODO: Checkbox handling
      value = (el as HTMLInputElement).checked;
    }

    set(domy.state.data.reactiveObj, objPath, value);
  }

  el.addEventListener('input', changeValue);
  el.addEventListener('change', changeValue);

  domy.effect(() => {
    const executedValue = domy.evaluate(domy.attr.value);
    const isValueArray = Array.isArray(executedValue);

    if (isValueArray && el.tagName === 'SELECT' && (el as HTMLSelectElement).multiple) {
      // TODO Fixe: wait child rendered before applying effect (maybe wait the on mount)
      // Handle select multiple
      const options = el.querySelectorAll(':scope>option') as NodeListOf<HTMLOptionElement>;

      for (const option of options) {
        option.selected = false;
      }

      for (const value of executedValue) {
        for (const option of options) {
          if (option.value === value) option.selected = true;
        }
      }
    } else if (isValueArray && el.type === 'checkbox') {
      // Handling multiple checkbox
      if (executedValue.includes(el.value)) (el as HTMLInputElement).checked = true;
    } else if (el.type === 'checkbox') {
      // Handling checkbox btn
      if (executedValue) (el as HTMLInputElement).checked = true;
    } else if (el.type === 'radio') {
      // Handling radio btn
      if (el.value === executedValue) (el as HTMLInputElement).checked = true;
    } else {
      // Handling other kind of element
      el.value = executedValue;
    }
  });
}
