import { DomySpecialHelper } from '../types/Domy';

/**
 * Allow to dispatch a registered event
 * Example: $dispatch("notify")
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
