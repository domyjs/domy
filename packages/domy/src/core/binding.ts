import { DomyDirectiveHelper } from '../types/Domy';

/**
 * Handle style attribute if it's an object
 * { backgroundColor: '#fff', color: 'red' .... }
 * @param domy
 * @param executedValue
 * @param defaultStyle
 *
 * @author yoannchb-pro
 */
function handleStyle(domy: DomyDirectiveHelper, executedValue: any, defaultStyle: string) {
  const el = domy.block.el as HTMLElement;

  el.setAttribute('style', defaultStyle ?? '');

  for (const styleName in executedValue) {
    el.style.setProperty(styleName, executedValue[styleName]);
  }
}

/**
 * Handle class attribute if it's an object like
 * { show: true }
 * or
 * ["show"]
 * @param domy
 * @param executedValue
 * @param defaultClass
 *
 * @author yoannchb-pro
 */
function handleClass(domy: DomyDirectiveHelper, executedValue: any, defaultClass: string) {
  const el = domy.block.el as HTMLElement;

  el.className = defaultClass ?? '';

  if (Array.isArray(executedValue)) {
    for (const className of executedValue) {
      el.classList.add(className);
    }
  } else {
    for (const [className, shouldBeSet] of Object.entries(executedValue)) {
      if (shouldBeSet) el.classList.add(className);
    }
  }
}

/**
 * Remove styles from the style attribute if they are in executedValue
 * { backgroundColor: true, color: true .... }
 * @param domy
 * @param executedValue
 *
 * @author yoannchb-pro
 */
function handleRemoveStyle(domy: DomyDirectiveHelper, executedValue: any) {
  const el = domy.block.el as HTMLElement;

  for (const styleName in executedValue) {
    if (executedValue[styleName]) {
      el.style.removeProperty(styleName);
    }
  }
}

/**
 * Remove class attribute if it's an object like
 * { show: true }
 * or
 * ["show"]
 * @param domy
 * @param executedValue
 *
 * @author yoannchb-pro
 */
function handleRemoveClass(domy: DomyDirectiveHelper, executedValue: any) {
  const el = domy.block.el as HTMLElement;

  if (Array.isArray(executedValue)) {
    for (const className of executedValue) {
      el.classList.remove(className);
    }
  } else {
    for (const [className, shouldBeRemoved] of Object.entries(executedValue)) {
      if (shouldBeRemoved) el.classList.remove(className);
    }
  }
}

/**
 * Handle binding attributes like :class or d-bind:class
 * It will catch the value into the attribute
 * Example: with isOpen = true
 * d-bind:class="isOpen ? 'show' : 'hide'"
 * will give
 * class="show"
 * @param domy
 *
 * @author yoannchb-pro
 */
export function binding(domy: DomyDirectiveHelper) {
  const el = domy.block.el;
  const attrName = domy.attrName;

  // We register the default style and default class
  // To handle :class with class as same time (same for style)
  const defaultStyle = attrName === 'style' && el.getAttribute('style');
  const defaultClass = attrName === 'class' && el.getAttribute('class');

  // We check the attribute is not already present (only class and style can already be there)
  if (attrName !== 'class' && attrName !== 'style' && el.getAttribute(attrName))
    throw new Error(`Binding failed. The attribute "${attrName}" already exist on the element.`);

  let lastExecutedValue: any = null;

  domy.effect(() => {
    const executedValue = domy.evaluate(domy.attr.value);
    const isExecutedValueObject = typeof executedValue === 'object' && executedValue !== null;

    lastExecutedValue = executedValue;

    if (isExecutedValueObject && attrName === 'style') {
      handleStyle(domy, executedValue, defaultStyle as string);
    } else if (isExecutedValueObject && attrName === 'class') {
      handleClass(domy, executedValue, defaultClass as string);
    } else {
      el.setAttribute(attrName, executedValue);
    }
  });

  domy.cleanup(() => {
    const isExecutedValueObject =
      typeof lastExecutedValue === 'object' && lastExecutedValue !== null;

    if (isExecutedValueObject && attrName === 'style') {
      handleRemoveStyle(domy, lastExecutedValue);
    } else if (isExecutedValueObject && attrName === 'class') {
      handleRemoveClass(domy, lastExecutedValue);
    } else {
      el.removeAttribute(attrName);
    }
  });
}
