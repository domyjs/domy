import { State } from '@domy/types';
import { Signal } from './Signal';
import { VirtualElement, VirtualText } from './VitualDom';
import { renderText } from './renderText';
import { renderElement } from './renderElement';

type Props = {
  $state: State;
  virtualParent: VirtualElement | null;
  virtualElement: VirtualElement | VirtualText;

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
  if ('content' in props.virtualElement) {
    return renderText({
      $state: props.$state,
      virtualParent: props.virtualParent,
      virtualElement: props.virtualElement,
      injectState: props.injectState
    });
  }

  return renderElement({
    $state: props.$state,
    virtualParent: props.virtualParent,
    virtualElement: props.virtualElement,
    injectState: props.injectState,
    byPassAttributes: props.byPassAttributes
  });
}
