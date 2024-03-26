import { Signal } from './Signal';
import { VirtualElement } from './VitualDom';
import { isBindAttr, isDomyAttr, isEventAttr } from '@utils/isSpecialAttribute';
import { binding } from './binding';
import { domies } from './domies';
import { events } from './events';
import { State } from '@typing/State';
import { AttrRendererProps } from '@typing/AttrRendererProps';
/**
 * Render every domy attributes of an element
 * @param virtualParent
 * @param virtualElement
 * @param injectState Inject a state just for this render
 * @param byPassAttributes Attributes to do not look
 * @returns
 */
export function renderElement(
  $state: State,
  virtualParent: VirtualElement | null,
  virtualElement: VirtualElement,
  injectState: Signal[] = [],
  byPassAttributes: string[] = []
) {
  // We don't render comment
  if (virtualElement.tag === 'comment') return;

  const domiesAttributes = virtualElement.domiesAttributes;

  for (const attr of Object.keys(domiesAttributes)) {
    // Check if we have to bypass this attribute or not
    if (byPassAttributes.includes(attr)) continue;

    // If the element is not displayed we don't need to render the differents attributes
    if (attr !== 'd-if' && !virtualElement.isDisplay) continue;

    const props: AttrRendererProps = {
      $state: {
        ...$state,
        $state: [...$state.$state, ...injectState]
      },
      virtualParent,
      virtualElement,
      attr: { name: attr, value: domiesAttributes[attr] },
      notifier: () => renderElement($state, virtualParent, virtualElement, injectState)
    };

    if (isBindAttr(attr)) {
      binding(props);
    } else if (isEventAttr(attr)) {
      events(props);
    } else if (isDomyAttr(attr)) {
      domies(props);
    }
  }
}
