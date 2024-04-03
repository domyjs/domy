import { evaluate } from '../utils/evaluate';
import { DomyProps } from '../types/Domy';

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
export function renderText(domy: DomyProps) {
  let originalTextContent = domy.el.textContent ?? '';

  domy.effect(() => {
    domy.el.textContent = originalTextContent.replace(
      /\{\{\s*(?<org>.+?)\s*\}\}/gi,
      function (_, code) {
        return evaluate({
          code,
          returnResult: true,
          $state: {
            ...domy.$state,
            $state: [...(props.injectState ?? []), ...props.$state.$state]
          },
          context: null
        });
      }
    );
  });
}

/**
 * virtualParent: props.virtualParent,
          virtualElement: props.virtualElement,
          notifier: () =>
            renderText({
              $state: props.$state,
              virtualParent: props.virtualParent,
              virtualElement: props.virtualElement,
              injectState: props.injectState
            })
 */
