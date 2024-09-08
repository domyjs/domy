import { Components } from '../types/Component';
import { Config } from '../types/Config';
import { DomyDirectiveReturn } from '../types/Domy';
import { State } from '../types/State';
import {
  sortAttributesBasedOnSortedDirectives,
  getDomyAttributeInformations
} from '../utils/domyAttrUtils';
import { isNormalAttr } from '../utils/isSpecialAttribute';
import { DomyHelper } from './DomyHelper';
import { renderAttribute } from './renderAttribute';
import { renderComponent } from './renderComponent';
import { renderText } from './renderText';

type Elem = {
  element: Element;
  byPassAttributes?: string[];
  scopedNodeData?: Record<string, any>[];
};

type Props = {
  element: Element;
  scopedNodeData: Record<string, any>[];
  byPassAttributes?: string[];
  renderWithoutListeningToChange?: boolean;
};

/**
 * Deep render an element (with the childs and textContent)
 * It will keep the config for all the specified target only
 * @param config
 *
 * @author yoannchb-pro
 */
export function createDeepRenderFn(state: State, config: Config, components: Components) {
  return function deepRender(props: Props) {
    const toRenderList: Elem[] = [
      {
        element: props.element,
        byPassAttributes: props.byPassAttributes,
        scopedNodeData: props.scopedNodeData ?? []
      }
    ];

    while (toRenderList.length > 0) {
      let skipChildRendering = false;

      // We use pop for performance issue and because we render the tree from the bottom to top
      // It's usefull in the case of d-if, d-else-if, d-else to find the previous sibling element which are conditions
      const toRender = toRenderList.pop() as Elem;
      const element = toRender.element;

      // To avoid infinite loop
      // Example: <div d-once d-cloak></div> will create a bug without this safe function
      // Because each directive call deeprender with byPassAttributes
      const safeDeepRender = (args: Props) => {
        deepRender({
          ...args,
          byPassAttributes: [...(toRender.byPassAttributes ?? []), ...(args.byPassAttributes ?? [])]
        });
      };

      let domyHelper = new DomyHelper(
        safeDeepRender,
        element,
        state,
        toRender.scopedNodeData,
        config
      );

      // Rendering textContent
      if (element.nodeType === Node.TEXT_NODE) {
        renderText(domyHelper.getPluginHelper());
        domyHelper.callEffect();
        continue;
      }

      // Rendering components
      if (element.localName in components) {
        renderComponent(
          domyHelper.getPluginHelper(),
          element as HTMLElement,
          components[element.localName]
        );
        domyHelper.callEffect();
        skipChildRendering = true;
        // We don't "continue" to ensure the events will be attach to the components
      }

      // Rendering attributes if it's an element
      const sortedAttributes = sortAttributesBasedOnSortedDirectives(element.attributes);

      for (const attr of sortedAttributes) {
        const shouldByPassAttribute =
          toRender.byPassAttributes && toRender.byPassAttributes.includes(attr.name);

        if (shouldByPassAttribute || isNormalAttr(attr.name)) continue;

        // We create a copy of the scopedNodeData because after the attribute is rendered it will remove the scopedNodeData
        domyHelper = new DomyHelper(
          safeDeepRender,
          element,
          state,
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
