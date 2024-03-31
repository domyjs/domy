import { State } from '@typing/State';
import { Signal } from './Signal';
import { VirtualElement, VirtualText } from './VitualDom';
import { func } from '@utils/func';

type Props = {
  $state: State;
  virtualParent: VirtualElement | null;
  virtualElement: VirtualText;

  injectState?: Signal[];
};

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
export function renderText(props: Props) {
  const $el = props.virtualElement.$el;

  $el.textContent = props.virtualElement.content.replace(
    /\{\{\s*(?<org>.+?)\s*\}\}/gi,
    function (_, code) {
      return func({
        code,
        returnResult: true,
        $state: {
          ...props.$state,
          $state: [...(props.injectState ?? []), ...props.$state.$state]
        },
        virtualParent: props.virtualParent,
        virtualElement: props.virtualElement,
        notifier: () =>
          renderText({
            $state: props.$state,
            virtualParent: props.virtualParent,
            virtualElement: props.virtualElement,
            injectState: props.injectState
          })
      });
    }
  );
}
