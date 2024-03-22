import { AttrRendererProps } from '@typing/AttrRendererProps';
import { func } from '@utils/func';

export function events(props: AttrRendererProps) {
  const domyAttrName = props.attr.name;

  const eventName = domyAttrName.startsWith('@')
    ? domyAttrName.slice(1)
    : domyAttrName.slice('d-on:'.length);

  props.virtualElement.$el.removeAttribute(domyAttrName);
  props.virtualElement.$el.addEventListener(eventName, function (event) {
    const executedValue = func({
      code: props.attr.value,
      returnResult: true,
      $state: props.$state,
      virtualParent: props.virtualParent,
      virtualElement: props.virtualElement
    });
    if (typeof executedValue === 'function') executedValue(event);
  });
}
