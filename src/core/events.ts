import { AttrRendererProps } from '@typing/AttrRendererProps';
import { func } from '@utils/func';
import { getContext } from '@utils/getContext';

/**
 * Handle event applied on an item
 * Example:
 * d-on:click="console.log('hello')"
 * will add an event listener on the click
 * @param props
 */
export function events(props: AttrRendererProps) {
  const $el = props.virtualElement.$el;
  const $state = props.$state;
  const domyAttrName = props.attr.name;

  const eventName = domyAttrName.startsWith('@')
    ? domyAttrName.slice(1)
    : domyAttrName.slice('d-on:'.length);

  // Remove last registered event
  $el.removeAttribute(domyAttrName);

  // Register the event for the $dispatch function
  if (!$state.$events[eventName]) $state.$events[eventName] = [];
  const elIndex = $state.$events[eventName].findIndex(el => el === $el);
  if (elIndex === -1) $state.$events[eventName].push($el);

  // Add the event listener
  if (props.virtualElement.events[eventName])
    $el.removeEventListener(eventName, props.virtualElement.events[eventName]);
  props.virtualElement.events[eventName] = function (event) {
    const executedValue = func({
      code: props.attr.value,
      returnResult: true,
      $state: props.$state,
      virtualParent: props.virtualParent,
      virtualElement: props.virtualElement,
      notifier: props.notifier
    });
    if (typeof executedValue === 'function')
      executedValue.call(getContext($el, props.$state), event);
  };
  $el.addEventListener(eventName, props.virtualElement.events[eventName]);
}
