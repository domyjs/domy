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
  const queueId = domy.getUniqueQueueId();
  const eventName = domy.attrName;
  let el = domy.block.el;

  let removeEventListener: (() => void) | null = null;

  function setUpEvent() {
    const eventListener: EventListenerOrEventListenerObject = async event => {
      const scope = {
        $event: event
      };

      domy.queueJob(() => {
        const executedValue = domy.evaluate(domy.attr.value, scope);
        if (typeof executedValue === 'function') executedValue(event);
      }, queueId);
    };

    // We add wrappers to the listener to ensure we can add modifiers
    const wrap = on({
      el: el,
      eventName,
      listener: eventListener,
      modifiers: domy.modifiers
    });

    wrap.listenerTarget.addEventListener(wrap.eventName, wrap.listener, wrap.options);

    removeEventListener = () =>
      wrap.listenerTarget.removeEventListener(wrap.eventName, wrap.listener, wrap.options);
  }

  setUpEvent();

  const cleanup = () => {
    if (removeEventListener) removeEventListener();
  };

  domy.block.onElementChange(newEl => {
    cleanup();
    el = newEl;
    setUpEvent();
  });

  domy.cleanup(cleanup);
}
