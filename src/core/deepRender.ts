import { State } from '@typing/State';
import { Signal } from './Signal';
import { VirtualElement, VirtualText } from './VitualDom';
import { render } from './render';

type Elem = { parent: VirtualElement | null; element: VirtualElement | VirtualText };

/**
 * Deep render an element or textContent with hsi childs
 * @param $state
 * @param virtualParent
 * @param virtualElement
 * @param injectState
 * @param byPassAttributes
 * @returns
 */
export function deepRender(
  $state: State,
  virtualParent: VirtualElement | null,
  virtualElement: VirtualElement | VirtualText,
  injectState: Signal[] = [],
  byPassAttributes: string[] = []
) {
  const toRenderList: Elem[] = [{ parent: virtualParent, element: virtualElement }];

  while (toRenderList.length > 0) {
    const toRender = toRenderList.shift() as Elem;

    render($state, toRender.parent, toRender.element, injectState, byPassAttributes);

    if ('childs' in toRender.element) {
      for (const child of toRender.element.childs) {
        toRenderList.push({
          parent: toRender.element,
          element: child
        });
      }
    }
  }
}
