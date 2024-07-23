import { DomyDirectiveHelper, DomyDirectiveReturn } from '../types/Domy';
import { set } from '../utils/getAndSet';

type Value = string | number | boolean | string[] | undefined;

/**
 * d-model implementation
 * Handle input, select and checkbox
 * @param domy
 *
 * @author yoannchb-pro
 */
export function dModelImplementation(domy: DomyDirectiveHelper): DomyDirectiveReturn {
  const el = domy.el as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

  // We ensure to render the element/childs first so we can access to their value
  // For example select need to know the options value so we ensure to render the child(s) first
  domy.deepRender({
    element: domy.el,
    state: domy.state,
    byPassAttributes: [domy.attr.name]
  });

  /**
   * Trigger a change to the data when the value on input change
   */
  function changeValue() {
    let value: Value = el.value;
    const prevValue = domy.evaluateWithoutListening(domy.attr.value);
    const isPrevValueArray = Array.isArray(prevValue);

    if (el.tagName === 'SELECT') {
      // Select handling
      const select = el as HTMLSelectElement;
      const isMultiple = select.multiple;
      const selectedOptions = select.selectedOptions;

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
      value = isNaN(value) ? 0 : value;
    } else if (el.type === 'radio') {
      // Radio handling
      const radio = el as HTMLInputElement;
      if (radio.checked) value = el.value;
    } else if (el.type === 'checkbox') {
      // Checkbox handling
      const checkbox = el as HTMLInputElement;
      const isChecked = checkbox.checked;

      if (!isPrevValueArray) {
        value = isChecked;
      } else {
        if (isChecked && !prevValue.includes(value)) {
          value = [...prevValue, value];
        } else if (!isChecked && prevValue.includes(value)) {
          value = prevValue.filter(e => e !== value);
        } else {
          value = prevValue;
        }
      }
    }

    const config = domy.getConfig();
    const isCsp = config.CSP;
    const avoidDeprecatedWith = config.avoidDeprecatedWith;

    if (isCsp) {
      const objPath = avoidDeprecatedWith
        ? domy.attr.value.replace(/^this\./g, '')
        : domy.attr.value;
      set(domy.state.data.reactiveObj, objPath, value);
    } else {
      const setter = domy.evaluateWithoutListening(`(__val) => (${domy.attr.value}) = __val`);
      setter(value);
    }
  }

  // We look at change made by the user
  el.addEventListener(domy.modifiers.includes('lazy') ? 'change' : 'input', changeValue);

  domy.effect(() => {
    const executedValue = domy.evaluate(domy.attr.value);
    const isValueArray = Array.isArray(executedValue);

    if (isValueArray && el.tagName === 'SELECT' && (el as HTMLSelectElement).multiple) {
      // Handle multiple select
      const options = el.querySelectorAll('option') as NodeListOf<HTMLOptionElement>;

      for (const option of options) {
        option.selected = executedValue.includes(option.value);
      }
    } else if (isValueArray && el.type === 'checkbox') {
      // Handling multiple checkbox
      const checkbox = el as HTMLInputElement;
      checkbox.checked = executedValue.includes(checkbox.value);
    } else if (el.type === 'checkbox') {
      // Handling checkbox
      const checkbox = el as HTMLInputElement;
      checkbox.checked = executedValue;
    } else if (el.type === 'radio') {
      // Handling radio
      const radio = el as HTMLInputElement;
      radio.checked = radio.value === executedValue;
    } else {
      // Handling other kind of element
      el.value = executedValue;
    }
  });

  return { skipChildsRendering: true, skipOtherAttributesRendering: true };
}
