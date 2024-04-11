import { DomySpecialHelper } from '../types/Domy';

export function $dispatch(domy: DomySpecialHelper) {
  return (eventName: string) => {
    const attachedElements = domy.state.events[eventName] ?? [];
    for (const attachedElement of attachedElements) {
      attachedElement.dispatchEvent(new CustomEvent(eventName));
    }
  };
}
