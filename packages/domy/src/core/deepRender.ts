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
 * Remove the domy "d-" prefix of a string
 * Otherwise it retun an empty string
 * @param attrName
 * @returns
 *
 * @author yoannchb-pro
 */
function removeDPrefix(str: string) {
  return str.startsWith('d-') ? str.slice(2) : '';
}

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

    // Rendering textContent
    if (element.nodeType === Node.TEXT_NODE) {
      renderText(domyHelper.getPluginHelper());
      domyHelper.callEffect();
      continue;
    }

    const attributes = Array.from(element.attributes ?? []);
    // We ensure some attributes are rendered first like d-ignore, d-once, ...
    attributes.sort((a, b) => {
      const iA = PLUGINS.sortedDirectives.indexOf(removeDPrefix(a.name));
      const iB = PLUGINS.sortedDirectives.indexOf(removeDPrefix(b.name));
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
      const shouldByPassAttribute =
        toRender.byPassAttributes && toRender.byPassAttributes.includes(attr.name);

      if (shouldByPassAttribute || isNormalAttr(attr.name)) continue;

      // We create a copy of the scopedNodeData because after the attribute is rendered it will remove the scopedNodeData
      domyHelper = new DomyHelper(deepRender, element, props.state, [...domyHelper.scopedNodeData]);

      // We get the prefix, modifiers and attribute name
      const [attrNameWithPrefix, ...modifiers] = attr.name.split('.');
      let prefix = '';
      let attrName = attrNameWithPrefix;
      if (attrName.includes(':')) {
        [prefix, attrName] = attrName.split(':');
      }

      domyHelper.prefix = removeDPrefix(prefix);
      domyHelper.directive = removeDPrefix(attrName);
      domyHelper.modifiers = modifiers;

      domyHelper.attrName = attrName; // The attribute name without the modifiers and prefix (examples: d-for, style ...)
      domyHelper.attr.name = attr.name;
      domyHelper.attr.value = attr.value;

      // We render the attribute
      // It's the main logic of DOMY
      const options: DomyDirectiveReturn = renderAttribute(
        domyHelper.getPluginHelper(props.renderWithoutListeningToChange)
      );

      domyHelper.callEffect();

      element.removeAttribute(attr.name);

      // Handling options returned by the attribute
      if (options) {
        if (options.skipChildsRendering) skipChildRendering = true;
        if (options.skipOtherAttributesRendering) break;
      }
    }

    // We add the child of the element to the list to render them next
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
