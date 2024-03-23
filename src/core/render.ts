import { State } from '@typing/State';
import { Signal } from './Signal';
import { VirtualElement, VirtualText } from './VitualDom';
import { renderText } from './renderText';
import { renderElement } from './renderElement';

/**
 * Render a virtual element of a textContent
 * @param $state
 * @param virtualParent
 * @param virtualElement
 * @param injectState
 * @param byPassAttributes
 * @returns
 */
export function render(
  $state: State,
  virtualParent: VirtualElement | null,
  virtualElement: VirtualElement | VirtualText,
  injectState: Signal[] = [],
  byPassAttributes: string[] = []
) {
  if ('content' in virtualElement) {
    return renderText($state, virtualParent, virtualElement, injectState);
  } else {
    return renderElement($state, virtualParent, virtualElement, injectState, byPassAttributes);
  }
}
