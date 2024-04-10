import { State } from '../types/State';
import { isNormalAttr } from '../utils/isSpecialAttribute';
import { DomyHelper } from './DomyHelper';
import { renderAttribute } from './renderAttribute';
import { renderText } from './renderText';

type Elem = {
  element: Element;
  byPassAttributes?: string[];
  scopedNodeData?: Record<string, any>[];
};

type Props = {
  state: State;
  element: Element;
  byPassAttributes?: string[];
  scopedNodeData?: Record<string, any>[];
};

export function deepRender(props: Props) {
  const toRenderList: Elem[] = [
    {
      element: props.element,
      byPassAttributes: props.byPassAttributes,
      scopedNodeData: props.scopedNodeData ?? []
    }
  ];

  while (toRenderList.length > 0) {
    const toRender = toRenderList.shift() as Elem;
    const domyHelper = new DomyHelper(toRender.element, props.state, toRender.scopedNodeData);

    // Rendering text content
    if (toRender.element.nodeType === Node.TEXT_NODE) {
      renderText(domyHelper.getPluginHelper());
      domyHelper.callEffect();
      continue;
    }

    // Rendering attributes if it's an element
    for (const attr of toRender.element.attributes ?? []) {
      if (!isNormalAttr(attr.name) && !toRender.byPassAttributes?.includes(attr.name)) {
        const [attrName, ...variants] = attr.name.split('.');
        domyHelper.directive = attrName.slice(2); // We remove the prefix "d-"
        domyHelper.attr.name = attrName;
        domyHelper.attr.value = attr.value;
        domyHelper.variants = variants;
        renderAttribute(domyHelper.getPluginHelper());
        domyHelper.callEffect();
      }
    }

    for (const child of toRender.element.childNodes) {
      toRenderList.push({
        element: child as Element,
        scopedNodeData: [...domyHelper.scopedNodeData]
      });
    }
  }
}
