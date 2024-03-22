import { func } from '@utils/func';
import { AttrRendererProps } from '@typing/AttrRendererProps';

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
    virtualElement: props.virtualElement
  });

  props.virtualElement.$el.removeAttribute(domyAttrName);
  props.virtualElement.$el.setAttribute(attrName, executedValue);
}
