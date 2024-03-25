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
 * @param injectState Inject a state just for this render
 */
export function renderText(
  $state: State,
  virtualParent: VirtualElement | null,
  virtualElement: VirtualText,
  injectState: Signal[] = []
) {
  const $el = virtualElement.$el;

  $el.textContent = virtualElement.content.replace(
    /\{\{\s*(?<org>.+?)\s*\}\}/gi,
    function (_, code) {
      return func({
        code,
        returnResult: true,
        $state: {
          ...$state,
          $state: [...$state.$state, ...injectState]
        },
        notifier: () => renderText($state, virtualParent, virtualElement, injectState),
        virtualElement,
        virtualParent
      });
    }
  );
}
