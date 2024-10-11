import { Components } from '../types/Component';
import { Config } from '../types/Config';
import { DomyDirectiveReturn } from '../types/Domy';
import { State } from '../types/State';
import { sortAttributesBasedOnSortedDirectives } from '../utils/domyAttrUtils';
import { isBindAttr, isNormalAttr } from '../utils/isSpecialAttribute';
import { error } from '../utils/logs';
import { DomyHelper } from './DomyHelper';
import { renderAttribute } from './renderAttribute';
import { renderText } from './renderText';

type Elem = {
  element: Element;
  scopedNodeData?: Record<string, any>[];
};

type Props = {
  element: Element;
  scopedNodeData: Record<string, any>[];
  byPassAttributes?: string[];
  skipChildRendering?: boolean;
  renderWithoutListeningToChange?: boolean;
  onRenderedElementChange?: (renderedElement: Element) => void;
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
    const cleanupFnList: DomyHelper['callCleanup'][] = [];

    const toRenderList: Elem[] = [
      {
        element: props.element,
        scopedNodeData: props.scopedNodeData ?? []
      }
    ];

    // Ensure we get the rendered element even if it cloned or replaced
    let renderedRootElement: Element | (() => Element) = props.element;

    while (toRenderList.length > 0) {
      let skipOtherAttributesRendering = false;
      let skipChildRendering = props.skipChildRendering ?? false;
      let skipComponentRendering = false;

      // We use pop for performance issue and because we render the tree from the bottom to top
      // It's usefull in the case of d-if, d-else-if, d-else to find the previous sibling element which are conditions
      const toRender = toRenderList.pop() as Elem;
      const element = toRender.element;
      const isRootRendering = element === props.element;

      // Ensure we get the rendered element even if it cloned or replace
      let renderedElement: Element | (() => Element) = element;
      const onRenderedElementChangeCallbacks =
        isRootRendering && props.onRenderedElementChange ? [props.onRenderedElementChange] : [];
      const getRenderedElement = () =>
        typeof renderedElement === 'function' ? renderedElement() : renderedElement;
      const setRenderedElement = (render: Element | (() => Element)) => {
        const lastRenderedElement = getRenderedElement();

        if (element === props.element) renderedRootElement = render;
        renderedElement = render;

        if (lastRenderedElement !== getRenderedElement()) {
          for (const onRenderedElementChangeCallback of onRenderedElementChangeCallbacks) {
            try {
              onRenderedElementChangeCallback(getRenderedElement());
            } catch (err: any) {
              error(err);
            }
          }
        }
      };
      const onRenderedElementChange = (cb: (newRenderedElement: Element) => void) => {
        onRenderedElementChangeCallbacks.push(cb);
      };

      const safeDeepRender = (args: Props) => {
        const render = deepRender(args);

        const isCurrentElement = args.element === getRenderedElement();
        if (isCurrentElement) {
          // We keep trace of the rendered element
          setRenderedElement(render.getRenderedElement);

          // If deep render is called on the current element we skip the current rendering to avoid errors
          skipChildRendering = true;
          skipComponentRendering = true;
          skipOtherAttributesRendering = true;
        }

        cleanupFnList.push(render.unmount); // We ensure to unmount the new rendered element

        return render;
      };

      let domyHelper = new DomyHelper(
        safeDeepRender,
        getRenderedElement(),
        setRenderedElement,
        onRenderedElementChange,
        state,
        toRender.scopedNodeData,
        config
      );

      // Rendering textContent
      if (element.nodeType === Node.TEXT_NODE) {
        renderText(domyHelper.getPluginHelper());
        domyHelper.callEffect();
        cleanupFnList.push(domyHelper.getUnmountFn());
        continue;
      }

      // Rendering attributes if it's an element
      const sortedAttributes = sortAttributesBasedOnSortedDirectives(element.attributes);
      const isComponent = element.localName in components;

      for (const attr of sortedAttributes) {
        const shouldByPassAttribute =
          props.byPassAttributes && props.byPassAttributes.includes(attr.name);

        if (shouldByPassAttribute || isNormalAttr(attr.name)) continue;
        if (isComponent && (isBindAttr(attr.name) || isNormalAttr(attr.name))) continue; //  We only render the directives/events for a component

        // We create a copy of the scopedNodeData because after the attribute is rendered it will remove the scopedNodeData (but we still need it for later)
        // We also need a new domy helper because every attribute need his own call effect
        domyHelper = domyHelper.copy();

        domyHelper.setAttrInfos(attr);

        // We render the attribute
        // It's the main logic of DOMY
        element.removeAttribute(attr.name);
        const options: DomyDirectiveReturn = renderAttribute(
          domyHelper.getPluginHelper(props.renderWithoutListeningToChange)
        );
        domyHelper.callEffect();
        cleanupFnList.push(domyHelper.getUnmountFn());

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
        domyHelper.callEffect();
        cleanupFnList.push(domyHelper.getUnmountFn());
        continue;
      }

      // Rendering childs
      if (skipChildRendering) continue;
      for (const child of element.childNodes) {
        if ((child as HTMLElement).tagName === 'SCRIPT') continue; // We ensure we never render script

        toRenderList.push({
          element: child as Element,
          scopedNodeData: domyHelper.scopedNodeData
        });
      }
    }

    // Deep render helpers
    return {
      getRenderedElement() {
        return typeof renderedRootElement === 'function'
          ? renderedRootElement()
          : renderedRootElement;
      },
      unmount() {
        for (const cleanupFn of cleanupFnList) {
          try {
            cleanupFn();
          } catch (err: any) {
            error(err);
          }
        }
      }
    };
  };
}
