import { Signal } from './Signal';
import { renderText } from './renderText';
import { renderElement } from './renderElement';
import { State } from '../types/State';

type Props = {
  $state: State;
  parent: Element | null;
  element: Element;

  injectState?: Signal[];
  byPassAttributes?: string[];
};

/**
 * Render a virtual element of a textContent
 * @param $state
 * @param virtualParent
 * @param virtualElement
 * @param injectState
 * @param byPassAttributes
 * @returns
 */
export function render(props: Props) {
  if (props.element.nodeType === Node.TEXT_NODE) {
    return renderText({
      $state: props.$state,
      parent: props.parent,
      element: props.element,
      injectState: props.injectState
    });
  }

  return renderElement({
    $state: props.$state,
    parent: props.parent,
    element: props.element,
    injectState: props.injectState,
    byPassAttributes: props.byPassAttributes
  });
}
