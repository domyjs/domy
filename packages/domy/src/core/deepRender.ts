import { Config } from '../types/Config';
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
 * Get the name of a domy attribute/prefix
 * It will remove the domy "d-" prefix of a string
 * Otherwise it retun an empty string
 * @param attrName
 * @returns
 *
 * @author yoannchb-pro
 */
function getDomyName(str: string) {
  return str.startsWith('d-') ? str.slice(2) : '';
}

/**
 * Retrieve some utils informations from a domy attribute
 * @param attr
 * @returns
 *
 * @author yoannchb-pro
 */
function getDomyAttributeInformations(attr: Attr) {
  // Allow us to separate the prefix, the domy attribute name and the modifiers
  const [attrNameWithPrefix, ...modifiers] = attr.name.split('.');
  let prefix = '';
  let attrName = attrNameWithPrefix;
  if (attrName.includes(':')) {
    [prefix, attrName] = attrName.split(':');
  }

  return {
    prefix: getDomyName(prefix),
    directive: getDomyName(attrName),
    modifiers: new Set(modifiers),
    attrName: attrName
  };
}

/**
 * Sort a list of attributes based on the sorted directives order in plugin
 * It ensure some attributes are rendered first like d-ignore, d-once, ...
 * @param attrs
 * @returns
 *
 * @author yoannchb-pro
 */
function sortAttributesBasedOnSortedDirectives(attrs: NamedNodeMap) {
  const copy = Array.from(attrs ?? []);
  copy.sort((a, b) => {
    const iA = PLUGINS.sortedDirectives.indexOf(getDomyName(a.name));
    const iB = PLUGINS.sortedDirectives.indexOf(getDomyName(b.name));
    if (iA === -1) {
      return 1;
    } else if (iB === -1) {
      return -1;
    } else {
      return iA - iB;
    }
  });
  return copy;
}

/**
 * Deep render an element (with the childs and textContent)
 * It will keep the config for all the specified target only
 * @param config
 *
 * @author yoannchb-pro
 */
export function createConfigurableDeepRender(config: Config) {
  return function deepRender(props: Props) {
    const toRenderList: Elem[] = [
      {
        element: props.element,
        byPassAttributes: props.byPassAttributes,
        scopedNodeData: props.scopedNodeData ?? []
      }
    ];

    while (toRenderList.length > 0) {
      // We use pop for performance issue and because we render the tree from the bottom to top
      // It's usefull in the case of d-if, d-else-if, d-else to find the previous sibling element which are conditions
      const toRender = toRenderList.pop() as Elem;
      const element = toRender.element;

      let domyHelper = new DomyHelper(
        deepRender,
        element,
        props.state,
        toRender.scopedNodeData,
        config
      );

      // Rendering textContent
      if (element.nodeType === Node.TEXT_NODE) {
        renderText(domyHelper.getPluginHelper());
        domyHelper.callEffect();
        continue;
      }

      // Rendering attributes if it's an element
      const sortedAttributes = sortAttributesBasedOnSortedDirectives(element.attributes);

      let skipChildRendering = false;
      for (const attr of sortedAttributes) {
        const shouldByPassAttribute =
          toRender.byPassAttributes && toRender.byPassAttributes.includes(attr.name);

        if (shouldByPassAttribute || isNormalAttr(attr.name)) continue;

        // We create a copy of the scopedNodeData because after the attribute is rendered it will remove the scopedNodeData
        domyHelper = new DomyHelper(
          deepRender,
          element,
          props.state,
          [...domyHelper.scopedNodeData],
          config
        );

        const attrInfos = getDomyAttributeInformations(attr);
        domyHelper.prefix = attrInfos.prefix;
        domyHelper.directive = attrInfos.directive;
        domyHelper.modifiers = attrInfos.modifiers;
        domyHelper.attrName = attrInfos.attrName; // The attribute name without the modifiers and prefix (examples: d-on:click.{enter} -> click)
        domyHelper.attr.name = attr.name; // the full attribute name
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

      if (skipChildRendering) continue;

      for (const child of element.childNodes) {
        if ((child as HTMLElement).tagName === 'SCRIPT') continue; // We ensure we never render script

        toRenderList.push({
          element: child as Element,
          scopedNodeData: domyHelper.scopedNodeData
        });
      }
    }
  };
}
