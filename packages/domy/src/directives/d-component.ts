import { DomyDirectiveHelper, DomyDirectiveReturn } from '../types/Domy';

/**
 * d-component implementation
 * Render a component based on the name and transfert the attributes to it
 * @param domy
 *
 * @author yoannchb-pro
 */
export function dComponentImplementation(domy: DomyDirectiveHelper): DomyDirectiveReturn {
  const el = domy.getRenderedElement() as HTMLTemplateElement;

  if (el.tagName !== 'TEMPLATE')
    throw new Error(`The directive "${domy.directive}" sould only be use on template element.`);

  const childs = Array.from(el.content.childNodes);
  const attrs = domy.getRenderedElement().attributes;
  const reactiveComponent = domy.reactive({ $$component: null as null | Element });

  // We replace the current element by a d-render
  const render = document.createElement('template');
  render.setAttribute('d-render', '$$component');
  el.replaceWith(render);

  const renderedDRender: ReturnType<DomyDirectiveHelper['deepRender']> = domy.deepRender({
    element: render,
    scopedNodeData: [...domy.scopedNodeData, reactiveComponent]
  });

  domy.effect(() => {
    const componentName = domy.evaluate(domy.attr.value);

    if (!componentName) {
      reactiveComponent.$$component = null;
      return;
    }

    const componentElement = document.createElement(domy.utils.kebabToCamelCase(componentName));
    for (const attr of attrs) {
      componentElement.setAttribute(domy.utils.fixeAttrName(attr.name), attr.value);
    }
    for (const child of childs) {
      componentElement.appendChild(child);
    }

    reactiveComponent.$$component = domy.skipReactive(componentElement);
  });

  domy.cleanup(() => {
    renderedDRender.unmount();
  });

  return {
    skipChildsRendering: true,
    skipComponentRendering: true,
    skipOtherAttributesRendering: true
  };
}
