import { Signal } from './Signal';
import { VirtualElement } from './VitualDom';
import { isBindAttr, isDomyAttr, isEventAttr } from '@utils/isSpecialAttribute';
import { binding } from './binding';
import { domies } from './domies';
import { events } from './events';
import { State } from '@typing/State';
import { AttrRendererProps } from '@typing/AttrRendererProps';
import { data } from './data';

/**
 * Render every domy attributes of an element
 * @param virtualParent
 * @param virtualElement
 * @param injectState Inject a state just for this render
 * @param byPassAttributes Attrbiutes to do not look
 * @returns
 */
export function renderElement(
  $state: State,
  virtualParent: VirtualElement | null,
  virtualElement: VirtualElement | string,
  injectState: Signal[] = [],
  byPassAttributes: string[] = []
) {
  if (typeof virtualElement === 'string') return; // textContent don't have attributes

  // we inject the state for this rendering
  $state.$state.push(...injectState);

  const domiesAttributes = virtualElement.domiesAttributes;

  for (const attr of Object.keys(domiesAttributes)) {
    // Check if we have to bypass this attribute or not
    if (byPassAttributes.includes(attr)) continue;

    // If the element is not displayed we don't need to render the differents attributes
    if (attr !== 'd-if' && !virtualElement.isDisplay) continue;

    const props: AttrRendererProps = {
      $state,
      virtualParent,
      virtualElement,
      attr: { name: attr, value: domiesAttributes[attr] },
      notifier: () => renderElement($state, props.virtualParent, props.virtualElement)
    };

    if (isBindAttr(attr)) {
      binding(props);
    } else if (isEventAttr(attr)) {
      events(props);
    } else if (isDomyAttr(attr)) {
      domies(props);
    }
  }

  // We remove injected states
  for (const injectedSignal of injectState) {
    const index = $state.$state.findIndex(signal => signal === injectedSignal);
    $state.$state.splice(index, 1);
  }
}
