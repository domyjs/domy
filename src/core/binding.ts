import { func } from '@utils/func';
import { AttrRendererProps } from '@typing/AttrRendererProps';

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
  const domyAttrName = props.attr.name;

  const attrName = domyAttrName.startsWith(':')
    ? domyAttrName.slice(1)
    : domyAttrName.slice('d-bind:'.length);

  const executedValue = func({
    code: props.attr.value,
    returnResult: true,
    $state: props.$state,
    virtualParent: props.virtualParent,
    virtualElement: props.virtualElement,
    notifier: props.notifier
  });

  props.virtualElement.$el.removeAttribute(domyAttrName);
  props.virtualElement.$el.setAttribute(attrName, executedValue);
}
