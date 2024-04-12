import { DomyDirectiveReturn } from '../types/Domy';
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
  renderWithoutListeningToChange?: boolean;
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

    // Rendering attributes if it's an element
    let skipChildRendering = false;
    const attrToRemove: string[] = [];
    for (const attr of attributes) {
      domyHelper = new DomyHelper(toRender.element, props.state, [...domyHelper.scopedNodeData]);

      const shouldByPassAttribute =
        toRender.byPassAttributes && toRender.byPassAttributes.includes(attr.name);

      if (!shouldByPassAttribute && !isNormalAttr(attr.name)) {
        const [attrName, ...modifiers] = attr.name.split('.');

        domyHelper.directive = attrName.slice(2); // We remove the prefix "d-"
        domyHelper.attr.name = attrName;
        domyHelper.attr.value = attr.value;
        domyHelper.modifiers = modifiers;

        const options: DomyDirectiveReturn = renderAttribute(
          domyHelper.getPluginHelper(props.renderWithoutListeningToChange)
        );

        domyHelper.callEffect();

        attrToRemove.push(attr.name);

        // Handling options return by the attribute
        if (options) {
          if (options.skipChildsRendering) skipChildRendering = true;
          if (options.skipOtherAttributesRendering) break;
        }
      }
    }

    for (const attrName of attrToRemove) {
      toRender.element.removeAttribute(attrName);
    }

    // We reverse the child because in the case of d-if, d-else-if, d-else
    // the element need to know if is previousSibling is displayed or not and to access to the d-if or d-else-if content
    if (!skipChildRendering) {
      const reversedChild = Array.from(toRender.element.childNodes).reverse();
      for (const child of reversedChild) {
        toRenderList.push({
          element: child as Element,
          scopedNodeData: domyHelper.scopedNodeData
        });
      }
    }
  }
}
