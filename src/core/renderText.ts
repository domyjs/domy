import { State } from '@typing/State';
import { Signal } from './Signal';
import { VirtualElement, VirtualText } from './VitualDom';
import { func } from '@utils/func';

/**
 * Render a textContent
 * Example with count = 5:
 * Count: {{ this.count.value }}
 * Will give
 * Count: 5
 * @param $state
 * @param virtualParent
 * @param virtualElement
 * @param injectState
 */
export function renderText(
  $state: State,
  virtualParent: VirtualElement | null,
  virtualElement: VirtualText,
  injectState: Signal[] = []
) {
  // we inject the state for this rendering
  $state.$state.unshift(...injectState);

  const $el = virtualElement.$el;

  $el.textContent = virtualElement.content.replace(
    /\{\{\s*(?<org>.+?)\s*\}\}/gi,
    function (_, code) {
      return func({
        code,
        returnResult: true,
        $state,
        notifier: () => renderText($state, virtualParent, virtualElement),
        virtualElement,
        virtualParent
      });
    }
  );

  // We remove injected states
  $state.$state.splice(0, injectState.length);
}
