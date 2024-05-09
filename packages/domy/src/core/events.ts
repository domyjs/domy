import { DomyDirectiveHelper } from '../types/Domy';
import on from '../utils/on';

/**
 * Handle event applied on an item
 * Example:
 * d-on:click="console.log('hello')"
 * will add an event listener on the click
 * @param domy
 *
 * @author yoannchb-pro
 */
export function events(domy: DomyDirectiveHelper) {
  const domyAttrName = domy.attrName;
  const eventName = domyAttrName.startsWith('@') ? domyAttrName.slice(1) : domyAttrName;

  if (!domy.state.events[eventName]) domy.state.events[eventName] = [];
  domy.state.events[eventName].push(domy.el);

  const eventListener: EventListenerOrEventListenerObject = event => {
    // If the element is not present in the dom we don't execute the event
    if (!domy.el.isConnected) {
      return;
    }

    const $event = {
      $event: event
    };
    domy.addScopeToNode($event);

    const executedValue = domy.evaluateWithoutListening(domy.attr.value);

    // ensure nextTick is called after changing variable state
    if (typeof executedValue === 'function') {
      domy.queueJob(() =>
        executedValue.call(domy.getContext(domy.el, domy.state, domy.scopedNodeData), event)
      );
    }

    domy.removeScopeToNode($event);
  };

  on({
    el: domy.el,
    eventName,
    listener: eventListener,
    modifiers: domy.modifiers
  });
}
