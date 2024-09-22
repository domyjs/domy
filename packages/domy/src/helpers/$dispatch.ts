import { DomySpecialHelper } from '../types/Domy';

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
  return (eventName: string, ...args: any[]) => {
    const attachedFns = domy.state.events[eventName] ?? [];
    for (const attachedFn of attachedFns) {
      attachedFn(...args);
    }
  };
}
