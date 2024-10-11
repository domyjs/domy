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
  const eventName = domy.attrName;
  const el = domy.el;

  const originalFn = async (...args: any[]) => {
    const executedValue = await domy.evaluateWithoutListening(domy.attr.value);

    // Ensure $nextTick is called after changing variable state
    if (typeof executedValue === 'function') {
      domy.queueJob(() => executedValue(...args));
    }
  };

  const eventListener: EventListenerOrEventListenerObject = async event => {
    // If the element is not present in the dom we don't execute the event
    if (!el.isConnected) {
      return;
    }

    const scope = {
      $event: event
    };

    domy.addScopeToNode(scope);

    originalFn(event);

    domy.removeLastAddedScope();
  };

  // We add wrappers to the listener to ensure we can add modifiers
  const wrap = on({
    el: el,
    eventName,
    listener: eventListener,
    modifiers: domy.modifiers
  });

  wrap.listenerTarget.addEventListener(wrap.eventName, wrap.listener, wrap.options);

  domy.cleanup(() =>
    wrap.listenerTarget.removeEventListener(wrap.eventName, wrap.listener, wrap.options)
  );
}
