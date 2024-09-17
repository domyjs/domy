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
  skipChildRendering?: boolean;
  renderWithoutListeningToChange?: boolean;
  isComponentRendering?: boolean;
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
      let skipChildRendering = props.isComponentRendering || props.skipChildRendering;

      // We use pop for performance issue and because we render the tree from the bottom to top
      // It's usefull in the case of d-if, d-else-if, d-else to find the previous sibling element which are conditions
      const toRender = toRenderList.pop() as Elem;
      const element = toRender.element;

      const safeDeepRender = (args: Props) => {
        // If it's the same element we are currently deepRendering we keep the byPassAtributes to avoid infinite loop
        // Example: <div d-once d-cloak></div> each directives call deepRender with byPassAttributes so we need to keep trace of treated attributes
        const byPassAttributes =
          args.element === element
            ? [...(toRender.byPassAttributes ?? []), ...(args.byPassAttributes ?? [])]
            : args.byPassAttributes;
        // It ensure some attributes doesnt render the child of the component
        // Example: <Count d-if="showCount" :count="count"></Count> we doesnt want d-if to deep render component with the data of the app instead of the component
        const skipChildRendering = props.isComponentRendering || args.skipChildRendering;

        deepRender({
          ...args,
          byPassAttributes,
          skipChildRendering
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
        const componentSetup = components[element.localName];
        componentSetup({
          componentElement: element as HTMLElement,
          domy: domyHelper.getPluginHelper()
        });
        domyHelper.callEffect();
        continue;
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
