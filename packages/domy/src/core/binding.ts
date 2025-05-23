import { DomyDirectiveHelper } from '../types/Domy';
import { toKebabCase } from '../utils/toKebabCase';

/**
 * Handle style attribute if it's an object
 * { backgroundColor: '#fff', color: 'red' .... }
 * @param executedValue
 * @param defaultStyle
 *
 * @author yoannchb-pro
 */
export function handleStyle(executedValue: any, defaultStyle: string): string {
  const styleEntries = [];

  if (defaultStyle) {
    styleEntries.push(defaultStyle);
  }

  for (const styleName in executedValue) {
    const value = executedValue[styleName];
    const kebabCaseName = toKebabCase(styleName);
    styleEntries.push(`${kebabCaseName}:${value}`);
  }

  return styleEntries.join('; ');
}
/**
 * Handle class attribute if it's an object like
 * { show: true }
 * or
 * ["show"]
 * @param executedValue
 * @param defaultClass
 *
 * @author yoannchb-pro
 */
export function handleClass(executedValue: any, defaultClass: string): string {
  const classNames = new Set((defaultClass ?? '').split(/\s+/).filter(Boolean));

  if (Array.isArray(executedValue)) {
    for (const className of executedValue) {
      classNames.add(className);
    }
  } else {
    for (const [className, shouldBeSet] of Object.entries(executedValue)) {
      if (shouldBeSet) classNames.add(className);
    }
  }

  return [...classNames].join(' ');
}

/**
 * Remove styles from the style attribute if they are in executedValue
 * { backgroundColor: true, color: true .... }
 * @param currentStyle
 * @param executedValue
 *
 * @author yoannchb-pro
 */
export function handleRemoveStyle(currentStyle: string, executedValue: any) {
  const currentStyleDict: Record<string, string> = {};

  for (const style of currentStyle.split(';').filter(Boolean)) {
    const [key, value] = style.split(':');
    currentStyleDict[key] = value;
  }

  for (const styleName in executedValue) {
    if (executedValue[styleName] && currentStyleDict[styleName]) delete currentStyleDict[styleName];
  }

  return Object.entries(currentStyleDict)
    .map(([key, value]) => `${key}:${value}`)
    .join(';');
}

/**
 * Remove class attribute if it's an object like
 * { show: true }
 * or
 * ["show"]
 * @param currentClass
 * @param executedValue
 *
 * @author yoannchb-pro
 */
export function handleRemoveClass(currentClass: string, executedValue: any) {
  const classNames = new Set((currentClass ?? '').split(/\s+/).filter(Boolean));

  if (Array.isArray(executedValue)) {
    for (const className of executedValue) {
      classNames.delete(className);
    }
  } else {
    for (const [className, shouldBeRemoved] of Object.entries(executedValue)) {
      if (shouldBeRemoved) classNames.delete(className);
    }
  }

  return [...classNames].join(' ');
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
  const el = domy.block.el as HTMLElement;
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
      el.style = handleStyle(executedValue, defaultStyle as string);
    } else if (isExecutedValueObject && attrName === 'class') {
      el.className = handleClass(executedValue, defaultClass as string);
    } else {
      el.setAttribute(attrName, executedValue);
    }
  });

  domy.cleanup(() => {
    const isExecutedValueObject =
      typeof lastExecutedValue === 'object' && lastExecutedValue !== null;

    if (isExecutedValueObject && attrName === 'style') {
      el.style = handleRemoveStyle(el.style.all, lastExecutedValue);
    } else if (isExecutedValueObject && attrName === 'class') {
      el.className = handleRemoveClass(el.className, lastExecutedValue);
    } else {
      el.removeAttribute(attrName);
    }
  });
}
