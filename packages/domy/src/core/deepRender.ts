import { State } from '@domy/types';
import { Signal } from './Signal';
import { VirtualElement, VirtualText } from './VitualDom';
import { render } from './render';

type Elem = {
  parent: VirtualElement | null;
  element: VirtualElement | VirtualText;
  byPassAttributes?: string[];
};

type Props = {
  $state: State;
  virtualParent: VirtualElement | null;
  virtualElement: VirtualElement | VirtualText;

  injectState?: Signal[];
  byPassAttributes?: string[];
};

/**
 * Deep render an element or textContent with hsi childs
 * @param $state
 * @param virtualParent
 * @param virtualElement
 * @param injectState
 * @param byPassAttributes
 * @returns
 */
export function deepRender(props: Props) {
  const toRenderList: Elem[] = [
    {
      parent: props.virtualParent,
      element: props.virtualElement,
      byPassAttributes: props.byPassAttributes
    }
  ];

  while (toRenderList.length > 0) {
    const toRender = toRenderList.shift() as Elem;

    toRender.element.isDisplay = true;

    // We don't render d-ignore elements
    if (
      !('content' in toRender.element) &&
      typeof toRender.element.domiesAttributes['d-ignore'] === 'string'
    )
      continue;

    render({
      $state: props.$state,
      virtualParent: toRender.parent,
      virtualElement: toRender.element,
      injectState: props.injectState,
      byPassAttributes: toRender.byPassAttributes
    });

    // We don't render child if it's a d-for because d-for handle his childs by his self
    if (
      'childs' in toRender.element &&
      typeof toRender.element.domiesAttributes['d-for'] !== 'string'
    ) {
      for (const child of toRender.element.childs) {
        toRenderList.push({
          parent: toRender.element,
          element: child
        });
      }
    }
  }
}
