import { DomyDirectiveHelper } from '../types/Domy';
import { handleClass } from '../utils/handleClass';
import { handleStyle } from '../utils/handleStyle';

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
  const el = domy.block.getEl() as HTMLElement;
  const attrName = domy.attrName;
  const isStyle = attrName === 'style';
  const isClass = attrName === 'class';

  // We check the attribute is not already present (only class and style can already be there)
  if (!isClass && !isStyle && el.getAttribute(attrName))
    throw new Error(`Binding failed. The attribute "${attrName}" already exist on the element.`);

  let cleanFn: (() => void) | null = null;

  domy.effect(() => {
    // Cleaning last class/style
    if (cleanFn) cleanFn();

    const executedValue = domy.evaluate(domy.attr.value);

    if (isStyle) {
      const fixedStyle = handleStyle(executedValue, el.style.cssText);
      cleanFn = () => el.setAttribute('style', fixedStyle.cleanedStyle(el.style.cssText));
      el.setAttribute('style', fixedStyle.style);
    } else if (isClass) {
      const fixedClass = handleClass(executedValue, el.className);
      cleanFn = () => (el.className = fixedClass.cleanedClass(el.className));
      el.className = fixedClass.class;
    } else el.setAttribute(attrName, executedValue);
  });

  domy.cleanup(() => {
    if (cleanFn) cleanFn();
    else el.removeAttribute(attrName);
  });
}
