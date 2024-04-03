import { State } from '../types/State';
import { Signal } from './Signal';
import { render } from './render';

type Elem = {
  parent: Element | null;
  element: Element;
  byPassAttributes?: string[];
};

type Props = {
  $state: State;
  parent: Element | null;
  element: Element;

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
      parent: props.parent,
      element: props.element,
      byPassAttributes: props.byPassAttributes
    }
  ];

  while (toRenderList.length > 0) {
    const toRender = toRenderList.shift() as Elem;

    // We don't render d-ignore elements
    // if (
    //   !('content' in toRender.element) &&
    //   typeof toRender.element.domiesAttributes['d-ignore'] === 'string'
    // )
    //   continue;

    render({
      $state: props.$state,
      virtualParent: toRender.parent,
      virtualElement: toRender.element,
      injectState: props.injectState,
      byPassAttributes: toRender.byPassAttributes
    });

    if ('childs' in toRender.element) {
      for (const child of toRender.element.childNodes) {
        toRenderList.push({
          parent: toRender.element,
          element: child as Element
        });
      }
    }
  }
}
