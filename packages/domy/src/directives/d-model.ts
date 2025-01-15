import { DomyDirectiveHelper, DomyDirectiveReturn } from '../types/Domy';

type Value = string | number | boolean | string[] | undefined;

/**
 * Trigger a change to the data when the value of an input change
 *
 * @author yoannchb-pro
 */
function changeValue(domy: DomyDirectiveHelper) {
  const el = domy.block.el as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

  let value: Value = el.value;
  const prevValue = domy.evaluate(domy.attr.value);
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

  const config = domy.config;
  const isCsp = config.CSP;
  const avoidDeprecatedWith = config.avoidDeprecatedWith;

  if (isCsp) {
    const objPath = avoidDeprecatedWith ? domy.attr.value.replace(/^this\./g, '') : domy.attr.value;
    domy.utils.set(domy.state.data, objPath, value);
  } else {
    const setter = domy.evaluate(`(__val) => (${domy.attr.value}) = __val`);
    setter(value);
  }
}

/**
 * d-model implementation
 * Handle input, select and checkbox
 * @param domy
 *
 * @author yoannchb-pro
 */
export function dModelImplementation(domy: DomyDirectiveHelper): DomyDirectiveReturn {
  // We ensure to render the element/childs first so we can access to their value
  // For example select need to know the options value
  // So in case the value is a binding we need to ensure domy rendered the childs before handling d-model
  domy.onMounted(() => {
    const el = domy.block.el as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

    // We look at change made by the user
    const eventName = domy.modifiers.includes('lazy') ? 'change' : 'input';
    const listenChangeCallback = () => changeValue(domy);
    el.addEventListener(eventName, listenChangeCallback);

    domy.cleanup(() => {
      el.removeEventListener(eventName, listenChangeCallback);
    });

    // On a un pb car le effect s'ajoute avant les effects creer par le effect du d-for
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
  });
}
