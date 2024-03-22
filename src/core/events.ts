import { AttrRendererProps } from '@typing/AttrRendererProps';
import { func } from '@utils/func';

/**
 * Handle event applied on an item
 * Example:
 * d-on:click="console.log('hello')"
 * will add an event listener on the click
 * @param props
 */
export function events(props: AttrRendererProps) {
  const domyAttrName = props.attr.name;

  const eventName = domyAttrName.startsWith('@')
    ? domyAttrName.slice(1)
    : domyAttrName.slice('d-on:'.length);

  props.virtualElement.$el.removeAttribute(domyAttrName);

  if (props.virtualElement.events[eventName])
    props.virtualElement.$el.removeEventListener(eventName, props.virtualElement.events[eventName]);
  props.virtualElement.events[eventName] = function (event) {
    const executedValue = func({
      code: props.attr.value,
      returnResult: true,
      $state: props.$state,
      virtualParent: props.virtualParent,
      virtualElement: props.virtualElement,
      notifier: props.notifier
    });
    if (typeof executedValue === 'function') executedValue(event);
  };
  props.virtualElement.$el.addEventListener(eventName, props.virtualElement.events[eventName]);
}
