import { AttrRendererProps } from '@typing/AttrRendererProps';
import { attachClickAway } from '@utils/attachClickAway';
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

  const event = domyAttrName.startsWith('@')
    ? domyAttrName.slice(1)
    : domyAttrName.slice('d-on:'.length);

  const [defaultEventName, ...variants] = event.split('.');

  // Variants handling
  const isOnce = variants.includes('once');
  const isClickAway = defaultEventName === 'click' && variants.includes('away');
  const isKeyDownEnter = defaultEventName === 'keydown' && variants.includes('enter');

  if (isClickAway) attachClickAway($el);

  const eventName = isClickAway ? 'clickAway' : defaultEventName;

  $el.removeAttribute(domyAttrName);

  // Register the event for the $dispatch function
  if (!$state.$events[eventName]) $state.$events[eventName] = [];
  const elIndex = $state.$events[eventName].findIndex(el => el === $el);
  if (elIndex === -1) $state.$events[eventName].push($el);

  // Remove the last registered event listener
  const eventSet = props.virtualElement.events[eventName];
  if (eventSet) $el.removeEventListener(eventName, eventSet);

  // Add the new event listener
  const eventListener: EventListenerOrEventListenerObject = event => {
    // If the element is not present in the dom anymore we remove the event listener
    if (!$el.isConnected) {
      $el.removeEventListener(eventName, eventListener);
      delete props.virtualElement.events[eventName];
      return;
    }

    // We remove the events from the virtual dom once it's executed
    if (isOnce) delete props.virtualElement.domiesAttributes[props.attr.name];

    // Keydown enter logic
    if (isKeyDownEnter && (event as any).keyCode !== 13) return;

    const executedValue = func({
      code: props.attr.value,
      attrName: props.attr.name,
      returnResult: true,
      $state: props.$state,
      virtualParent: props.virtualParent,
      virtualElement: props.virtualElement,
      notifier: isOnce ? undefined : props.notifier
    });
    if (typeof executedValue === 'function')
      executedValue.call(getContext($el, props.$state), event);
  };

  props.virtualElement.events[eventName] = eventListener;
  $el.addEventListener(eventName, eventListener, { once: isOnce });
}
