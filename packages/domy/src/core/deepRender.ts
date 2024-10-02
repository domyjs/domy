import { Components } from '../types/Component';
import { Config } from '../types/Config';
import { DomyDirectiveReturn } from '../types/Domy';
import { State } from '../types/State';
import { sortAttributesBasedOnSortedDirectives } from '../utils/domyAttrUtils';
import { isDomyAttr, isNormalAttr } from '../utils/isSpecialAttribute';
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

function createGetRenderedElement(rendererElement: Element | (() => Element)) {
  return () => (typeof rendererElement === 'function' ? rendererElement() : rendererElement);
}

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
    // Usefull for d-render or d-for which need to keep a trace of the element
    let renderedElement: Element | (() => Element) = props.element;
    const setRenderedElement = (render: Element | (() => Element)) => {
      renderedElement = render;
      if (props.onRenderedElementChange)
        props.onRenderedElementChange(createGetRenderedElement(render)());
    };
    const getSetEl = (currentEl: Element) => (element: Element) => {
      currentEl === props.element && setRenderedElement(element);
    };

    while (toRenderList.length > 0) {
      let skipChildRendering = props.skipChildRendering ?? false;
      let skipComponentRendering = false;

      // We use pop for performance issue and because we render the tree from the bottom to top
      // It's usefull in the case of d-if, d-else-if, d-else to find the previous sibling element which are conditions
      const toRender = toRenderList.pop() as Elem;
      const element = toRender.element;

      const setEl = getSetEl(element);
      const safeDeepRender = (args: Props) => {
        const render = deepRender(args);
        if (args.element === renderedElement) setRenderedElement(render.getRenderedElement); // We keep trace of the rendered element
        return render;
      };

      let domyHelper = new DomyHelper(
        safeDeepRender,
        element,
        setEl,
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
        if (isComponent && !isDomyAttr(attr.name)) continue; //  We only render the directives for a component

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
      }

      // Rendering component
      if (isComponent && !skipComponentRendering) {
        const componentSetup = components[element.localName];
        const getRenderElement = componentSetup({
          name: element.localName,
          componentElement: element as HTMLElement,
          domy: domyHelper.getPluginHelper()
        });

        domyHelper.callEffect();
        if (getRenderElement) setRenderedElement(getRenderElement);
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
      getRenderedElement: createGetRenderedElement(renderedElement),
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
