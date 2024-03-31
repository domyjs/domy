import { Signal } from './Signal';
import { VirtualElement } from './VitualDom';
import { isBindAttr, isDomyAttr, isEventAttr } from '@utils/isSpecialAttribute';
import { binding } from './binding';
import { domies } from './domies';
import { events } from './events';
import { State } from '@typing/State';
import { AttrRendererProps } from '@typing/AttrRendererProps';

type Props = {
  $state: State;
  virtualParent: VirtualElement | null;
  virtualElement: VirtualElement;

  attr?: { name: string; value: string };
  injectState?: Signal[];
  byPassAttributes?: string[];
};

/**
 * Render every domy attributes of an element
 * @param virtualParent
 * @param virtualElement
 * @param injectState Inject a state just for this render
 * @param byPassAttributes Attributes to do not look
 * @returns
 */
export function renderElement(props: Props) {
  // We don't render comment
  if (props.virtualElement.tag === 'comment') return;

  const domiesAttributes = props.virtualElement.domiesAttributes;

  /**
   * Render an attribute
   * @param name
   * @param value
   * @returns
   */
  function renderAttribute(name: string, value: string) {
    console.log(name, value);
    // Check if we have to bypass this attribute or not
    if (props.byPassAttributes && props.byPassAttributes.includes(name)) return;

    // If the element is not displayed we don't need to render the differents attributes (except if it's d-if)
    if (name !== 'd-if' && !props.virtualElement.isDisplay) return;

    const attr = { name, value };

    const propsFn: AttrRendererProps = {
      $state: {
        ...props.$state,
        $state: [...(props.injectState ?? []), ...props.$state.$state]
      },
      virtualParent: props.virtualParent,
      virtualElement: props.virtualElement,
      attr,
      notifier: () =>
        renderElement({
          $state: props.$state,
          attr,
          virtualParent: props.virtualParent,
          virtualElement: props.virtualElement,
          injectState: props.injectState
        })
    };

    if (isBindAttr(name)) {
      binding(propsFn);
    } else if (isEventAttr(name)) {
      events(propsFn);
    } else if (isDomyAttr(name)) {
      domies(propsFn);
    }
  }

  // We check if we render all the element attributes or just a specific attribute
  if (props.attr) {
    renderAttribute(props.attr.name, props.attr.value);
  } else {
    for (const [name, value] of Object.entries(domiesAttributes)) {
      renderAttribute(name, value);
    }
  }
}
