import { State } from '../types/State';

/**
 * Allow to dispatch a custom event on all elements attached to it
 * @param state
 * @string
 */
export function dispatchCustomEvent(state: State) {
  return (eventName: string) => {
    const attachedElements = state.events[eventName] ?? [];
    for (const attachedElement of attachedElements) {
      attachedElement.dispatchEvent(new CustomEvent(eventName));
    }
  };
}
