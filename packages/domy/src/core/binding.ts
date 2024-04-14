import { DomyDirectiveHelper } from '../types/Domy';

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
  const orignalAttrName = domy.attrName;
  const attrName = orignalAttrName.startsWith(':')
    ? orignalAttrName.slice(1)
    : orignalAttrName.slice('d-bind:'.length);

  if (domy.el.getAttribute(attrName))
    throw new Error(`Binding failed. The attribute "${attrName}" already exist on the element.`);

  domy.effect(() => {
    const executedValue = domy.evaluate(domy.attr.value);

    if (attrName === 'style' && typeof executedValue === 'object' && executedValue !== null) {
      // Handle style attribute if it's an object
      // { backgroundColor: '#fff', color: 'red' .... }
      domy.el.removeAttribute('style');
      for (const styleName in executedValue) {
        (domy.el as HTMLElement).style[styleName as any] = executedValue[styleName];
      }
    } else if (
      attrName === 'class' &&
      typeof executedValue === 'object' &&
      executedValue !== null
    ) {
      // Handle class attribute if it's an object like
      // { show: true }
      // or
      // ["show"]
      domy.el.removeAttribute('class');
      if (Array.isArray(executedValue)) {
        for (const className of executedValue) {
          domy.el.classList.add(className);
        }
      } else {
        for (const [className, shouldBeSet] of Object.entries(executedValue)) {
          if (shouldBeSet) domy.el.classList.add(className);
        }
      }
    } else {
      // Handle any other kind of attribute
      domy.el.setAttribute(attrName, executedValue);
    }
  });
}
