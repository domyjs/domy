import { DomySpecialHelper } from '@domyjs/types/src/Domy';

/**
 * Allow to dispatch a registered event
 * Example:
 * <button @click="doSomething">Click me!</button>
 * $dispatch("click")
 * @param domy
 * @returns
 *
 * @author yoannchb-pro
 */
export function $dispatch(domy: DomySpecialHelper) {
  return (eventName: string) => {
    const attachedElements = domy.state.events[eventName] ?? [];
    for (const attachedElement of attachedElements) {
      attachedElement.dispatchEvent(new CustomEvent(eventName));
    }
  };
}
