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

/**
 * Deep render an element (with the childs and textContent)
 * @param props
 *
 * @author yoannchb-pro
 */
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
    let domyHelper = new DomyHelper(toRender.element, props.state, toRender.scopedNodeData);

    // Rendering text content
    if (toRender.element.nodeType === Node.TEXT_NODE) {
      renderText(domyHelper.getPluginHelper());
      domyHelper.callEffect();
      continue;
    }

    const attributes = Array.from(toRender.element.attributes ?? []);

    // Skipping element with d-ignore attribute
    const shouldBeIngored = attributes.findIndex(({ name }) => name === 'd-ignore') !== -1;
    if (shouldBeIngored) continue;

    // Should be rendered only once
    const shouldBeRenderedOnlyOnce = attributes.findIndex(({ name }) => name === 'd-once') !== -1;

    // Rendering attributes if it's an element
    const attrToRemove: string[] = [];
    for (const attr of attributes) {
      domyHelper = new DomyHelper(toRender.element, props.state, [...domyHelper.scopedNodeData]);

      const shouldByPassAttribute =
        toRender.byPassAttributes && toRender.byPassAttributes.includes(attr.name);

      if (!shouldByPassAttribute && !isNormalAttr(attr.name)) {
        const [attrName, ...variants] = attr.name.split('.');

        domyHelper.directive = attrName.slice(2); // We remove the prefix "d-"
        domyHelper.attr.name = attrName;
        domyHelper.attr.value = attr.value;
        domyHelper.variants = variants;

        renderAttribute(domyHelper.getPluginHelper(shouldBeRenderedOnlyOnce));

        domyHelper.callEffect();

        attrToRemove.push(attr.name);
      }
    }

    for (const attrName of attrToRemove) {
      toRender.element.removeAttribute(attrName);
    }

    for (const child of toRender.element.childNodes) {
      toRenderList.push({
        element: child as Element,
        scopedNodeData: domyHelper.scopedNodeData
      });
    }
  }
}
