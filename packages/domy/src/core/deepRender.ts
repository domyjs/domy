import { State } from '../types/State';
import { render } from './render';

type Elem = {
  element: Element;
  byPassAttributes?: string[];
};

type Props = {
  state: State;
  element: Element;
  byPassAttributes?: string[];
};

export function deepRender(props: Props) {
  const toRenderList: Elem[] = [
    {
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
      element: toRender.element,
      state: props.state
    });

    for (const child of toRender.element.childNodes) {
      toRenderList.push({
        element: child as Element
      });
    }
  }
}
