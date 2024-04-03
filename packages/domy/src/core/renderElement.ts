import { Signal } from './Signal';
import { isBindAttr, isDomyAttr, isEventAttr } from '../utils/isSpecialAttribute';
import { binding } from './binding';
import { domies } from './domies';
import { events } from './events';
import { State } from '../types/State';

type Props = {
  $state: State;
  parent: Element | null;
  element: Element;

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
  // We check if we render all the element attributes or just a specific attribute
  if (props.attr) {
    renderAttribute(props.attr.name, props.attr.value);
  } else {
    for (const [name, value] of Object.entries(domiesAttributes)) {
      renderAttribute(name, value);
    }
  }
}
