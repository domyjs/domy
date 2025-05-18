import { Components } from '../types/Component';
import { Config } from '../types/Config';
import { DomyDirectiveReturn } from '../types/Domy';
import { State } from '../types/State';
import { isBindAttr, isNormalAttr } from '../utils/isSpecialAttribute';
import { AppStateObserver } from './AppState';
import { Block } from './Block';
import { DOMY_EVENTS } from './DomyEvents';
import { DomyHelper } from './DomyHelper';
import { PluginHelper } from './plugin';
import { renderAttribute } from './renderAttribute';
import { renderText } from './renderText';

type Elem = {
  parentBlock?: Block;
  element: Element;
  scopedNodeData?: Record<string, any>[];
};

type Props = {
  element: Element | Block;
  scopedNodeData: Record<string, any>[];
  byPassAttributes?: string[];
  skipChildRendering?: boolean;
  renderWithoutListeningToChange?: boolean;
};

/**
 * Deep render an element (with the childs and textContent)
 * It will keep the config for all the specified target only
 * @param config
 *
 * @author yoannchb-pro
 */
export function createDeepRenderFn(
  appId: number,
  appState: AppStateObserver,
  state: State,
  config: Config,
  components: Components,
  pluginHelper: PluginHelper
) {
  // Deep render function for a specific block/element
  return function deepRender(props: Props) {
    const rootBlock = props.element instanceof Block ? props.element : new Block(props.element);
    const rootElement = rootBlock.el;

    const toRenderList: (Elem | (() => void))[] = [
      {
        element: rootElement,
        scopedNodeData: props.scopedNodeData ?? []
      }
    ];

    while (toRenderList.length > 0) {
      let skipOtherAttributesRendering = false;
      let skipChildRendering = props.skipChildRendering ?? false;
      let skipComponentRendering = false;

      // We use pop for performance issue and because we render the tree from the bottom to top
      // It's usefull in the case of d-if, d-else-if, d-else to find the previous sibling element which are conditions
      const toRender = toRenderList.pop()!;

      if (typeof toRender === 'function') {
        const action = toRender;
        action();
        continue;
      }

      const element = toRender.element;
      const isRootRendering = element === rootElement;

      // Creating the block
      const block = isRootRendering ? rootBlock : new Block(element);
      if (toRender.parentBlock) block.parentBlock = toRender.parentBlock;

      // If we are to the previous element then the next element is rendered because we go from bottom to top
      const lastRenderedElement = element.nextElementSibling;
      if (lastRenderedElement) {
        lastRenderedElement.dispatchEvent(new CustomEvent(DOMY_EVENTS.Element.Mounted));
      } else {
        // If the element doesn't have a next sibling then on the next render we want to ensure the mounted event on this element is dispatched
        toRenderList.push(() =>
          block.el.dispatchEvent(new CustomEvent(DOMY_EVENTS.Element.Mounted))
        );
      }

      const safeDeepRender = (args: Props) => {
        const render = deepRender(args);

        const argElement = args.element instanceof Block ? args.element.el : args.element;
        const isCurrentElement = argElement === block.el;
        if (isCurrentElement) {
          // If deep render is called on the current element we skip the current rendering to avoid errors
          skipChildRendering = true;
          skipComponentRendering = true;
          skipOtherAttributesRendering = true;
        }

        return render;
      };

      let domyHelper = new DomyHelper(
        appId,
        safeDeepRender,
        block,
        state,
        toRender.scopedNodeData,
        config,
        props.renderWithoutListeningToChange ?? false,
        appState,
        pluginHelper
      );

      // Rendering textContent
      if (element.nodeType === Node.TEXT_NODE) {
        if (/\{\{\s*(?<org>.+?)\s*\}\}/g.test(element.textContent ?? '')) {
          renderText(domyHelper.getPluginHelper());
          block.addCleanup(domyHelper.getCleanupFn());
        }

        continue;
      }

      // Rendering attributes if it's an element
      const isComponent = element.localName in components;
      const attrs = Array.from(element.attributes ?? []);

      for (const attr of attrs) {
        if (!block.el.hasAttribute(attr.name)) continue;

        const shouldByPassAttribute =
          props.byPassAttributes && props.byPassAttributes.includes(attr.name);

        if (shouldByPassAttribute || isNormalAttr(pluginHelper.PLUGINS, attr.name)) continue;
        if (isComponent && (isBindAttr(attr.name) || isNormalAttr(pluginHelper.PLUGINS, attr.name)))
          continue; //  We only render the directives/events for a component

        // We create a copy of the scopedNodeData because after the attribute is rendered it will remove the scopedNodeData (but we still need it for later)
        // We also need a new domy helper because every attribute need his own call effect
        domyHelper = domyHelper.copy();

        domyHelper.setAttrInfos(attr);

        // We render the attribute
        // It's the main logic of DOMY
        element.removeAttribute(attr.name);
        const options: DomyDirectiveReturn = renderAttribute(domyHelper.getPluginHelper());
        block.addCleanup(domyHelper.getCleanupFn());

        // Handling options returned by the attribute
        if (options) {
          if (options.skipChildsRendering) skipChildRendering = true;
          if (options.skipComponentRendering) skipComponentRendering = true;
          if (options.skipOtherAttributesRendering) break;
        }
        if (skipOtherAttributesRendering) break;
      }

      // Rendering component
      if (!skipComponentRendering && isComponent) {
        const componentSetup = components[element.localName];
        componentSetup({
          name: element.localName,
          componentElement: element as HTMLElement,
          domy: domyHelper.getPluginHelper()
        });
        block.addCleanup(domyHelper.getCleanupFn());
        continue;
      }

      // Rendering childs
      if (skipChildRendering) continue;
      for (const child of element.childNodes) {
        if ((child as HTMLElement).tagName === 'SCRIPT') continue; // We ensure we never render script

        toRenderList.push({
          parentBlock: block,
          element: child as Element,
          scopedNodeData: domyHelper.scopedNodeData
        });
      }
    }

    return rootBlock;
  };
}
