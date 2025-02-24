import type { Block } from '../core/Block';
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
  const needRender = domy.modifiers.includes('render');

  let render: Block | null = null;
  let lastAttrs: Record<string, string> = {};

  domy.effect(() => {
    const el = render?.el ?? domy.block.el;
    const attrs: Record<string, string> = domy.evaluate(domy.attr.value);

    if (render) render.unmount();

    // handled the cleanup in by binding.ts
    if (!needRender) {
      for (const attrName in lastAttrs) {
        el.removeAttribute(attrName);
      }
    }

    for (const attrName in attrs) {
      const value = attrs[attrName];
      const isObject = value !== 'string';
      el.setAttribute(attrName, isObject ? JSON.stringify(value) : value);
    }

    // In case we need to render DOMY attributes
    if (needRender) {
      render = domy.deepRender({
        element: el,
        scopedNodeData: domy.scopedNodeData,
        skipChildRendering: true
      });
    }

    lastAttrs = { ...attrs };
  });
}
