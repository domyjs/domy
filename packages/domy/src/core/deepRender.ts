import { DomyDirectiveReturn } from '../types/Domy';
import { State } from '../types/State';
import { isNormalAttr } from '../utils/isSpecialAttribute';
import { DomyHelper } from './DomyHelper';
import { PLUGINS } from './plugin';
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
    // const isTemplate = toRender.element instanceof HTMLTemplateElement;
    const element = toRender.element;

    let domyHelper = new DomyHelper(deepRender, element, props.state, toRender.scopedNodeData);

    // Rendering text content
    if (element.nodeType === Node.TEXT_NODE) {
      renderText(domyHelper.getPluginHelper());
      domyHelper.callEffect();
      continue;
    }

    const attributes = Array.from(element.attributes ?? []);
    // We ensure some attributes are rendered first like d-ingore, d-once, ...
    attributes.sort((a, b) => {
      const iA = PLUGINS.sortedDirectives.indexOf(a.name.slice(2));
      const iB = PLUGINS.sortedDirectives.indexOf(b.name.slice(2));
      if (iA === -1) {
        return 1;
      } else if (iB === -1) {
        return -1;
      } else {
        return iA - iB;
      }
    });

    // Rendering attributes if it's an element
    let skipChildRendering = false;
    for (const attr of attributes) {
      domyHelper = new DomyHelper(deepRender, element, props.state, [...domyHelper.scopedNodeData]);

      const shouldByPassAttribute =
        toRender.byPassAttributes && toRender.byPassAttributes.includes(attr.name);

      if (!shouldByPassAttribute && !isNormalAttr(attr.name)) {
        const [attrName, ...modifiers] = attr.name.split('.');

        domyHelper.directive = attrName.slice(2); // We remove the prefix "d-"
        domyHelper.attrName = attrName;
        domyHelper.attr.name = attr.name;
        domyHelper.attr.value = attr.value;
        domyHelper.modifiers = modifiers;

        const options: DomyDirectiveReturn = renderAttribute(
          domyHelper.getPluginHelper(props.renderWithoutListeningToChange)
        );

        domyHelper.callEffect();

        element.removeAttribute(attr.name);

        // Handling options return by the attribute
        if (options) {
          if (options.skipChildsRendering) skipChildRendering = true;
          if (options.skipOtherAttributesRendering) break;
        }
      }
    }

    // We reverse the child because in the case of d-if, d-else-if, d-else
    // the element need to know if is previousSibling is displayed or not and to access to the d-if or d-else-if content
    if (!skipChildRendering) {
      const reversedChild = Array.from(element.childNodes).reverse();
      for (const child of reversedChild) {
        toRenderList.push({
          element: child as Element,
          scopedNodeData: domyHelper.scopedNodeData
        });
      }
    }
  }
}
