import { DomyDirectiveHelper, DomyDirectiveReturn } from '../types/Domy';

/**
 * d-attrs implementation
 * Allow to dynamically set attrbiutes on an element
 * Example: <div d-attrs="{ title: 'Hello' }"></div>
 * Will give <div title="Hello"></div>
 * @param domy
 *
 * @author yoannchb-pro
 */
export function dAttrsImplementation(domy: DomyDirectiveHelper): DomyDirectiveReturn {
  let render: ReturnType<DomyDirectiveHelper['deepRender']> | null = null;
  let lastAttrs: Record<string, string> = {};

  domy.effect(() => {
    const el = render?.getRenderedElement() ?? domy.el;
    const attrs: Record<string, string> = domy.evaluate(domy.attr.value);

    if (render) render.unmount();

    for (const attrName in lastAttrs) {
      el.removeAttribute(attrName);
    }

    for (const attrName in attrs) {
      el.setAttribute(attrName, attrs[attrName]);
    }

    // In case we need to render DOMY attributes
    if (domy.modifiers.includes('render')) {
      render = domy.deepRender({
        element: el,
        scopedNodeData: domy.scopedNodeData
      });
    }

    lastAttrs = { ...attrs };
  });

  domy.cleanup(() => {
    if (render) render.unmount();
  });
}
