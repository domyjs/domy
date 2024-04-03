import { func } from '../utils/evaluate';
import { AttrRendererProps } from '@domyjs/types';

/**
 * Handle binding attributes like :class or d-bind:class
 * It will catch the value into the attribute
 * Example: with isOpen = true
 * d-bind:class="isOpen ? 'show' : 'hide'"
 * will give
 * class="show"
 * @param props
 */
export function binding(props: AttrRendererProps) {
  const $el = props.virtualElement.$el;
  const domyAttrName = props.attr.name;

  const attrName = domyAttrName.startsWith(':')
    ? domyAttrName.slice(1)
    : domyAttrName.slice('d-bind:'.length);

  const executedValue = func({
    code: props.attr.value,
    attrName: props.attr.name,
    returnResult: true,
    $state: props.$state,
    virtualParent: props.virtualParent,
    virtualElement: props.virtualElement,
    notifier: props.notifier
  });

  // Handle key attribute
  if (attrName === 'key' && !props.virtualElement.key) {
    if (typeof executedValue !== 'string' && typeof executedValue !== 'number')
      throw new Error(`Invalide key value: "${executedValue}".`);

    props.virtualElement.key = props.attr.value;
  }

  $el.removeAttribute(domyAttrName);

  if (attrName === 'style' && typeof executedValue === 'object') {
    // Handle style attribute if it's an object
    // { backgroundColor: '#fff', color: 'red' .... }
    for (const styleName in executedValue) {
      ($el as HTMLElement).style[styleName as any] = executedValue[styleName];
    }
  } else {
    $el.setAttribute(attrName, executedValue);
  }
}
