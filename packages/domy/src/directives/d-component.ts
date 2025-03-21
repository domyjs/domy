import { DomyDirectiveHelper, DomyDirectiveReturn } from '../types/Domy';

/**
 * d-component implementation
 * Render a component based on the name and transfert the attributes to it
 * @param domy
 *
 * @author yoannchb-pro
 */
export function dComponentImplementation(domy: DomyDirectiveHelper): DomyDirectiveReturn {
  if (!domy.block.isTemplate())
    throw new Error(`The directive "${domy.directive}" sould only be use on template element.`);

  const el = domy.block.el as HTMLTemplateElement;
  const childs = Array.from(el.content.childNodes);
  const attrs = el.attributes;

  // We replace the current element by a d-insert.render
  const render = document.createElement('template');
  render.setAttribute('d-insert.render', '$createComponent()');
  domy.block.replaceWith(render);

  // Because of d-insert.render watch function dependencie we will automtically re-execute this function when domy.attr.value change
  function $createComponent() {
    const componentName = domy.evaluate(domy.attr.value);

    if (!componentName) return null;

    const componentElement = document.createElement(domy.utils.kebabToCamelCase(componentName));
    for (const attr of attrs) {
      componentElement.setAttribute(domy.utils.fixeAttrName(attr.name), attr.value);
    }
    for (const child of childs) {
      componentElement.appendChild(child.cloneNode(true));
    }

    return componentElement;
  }

  // We render d-component as a d-insert.render
  domy.deepRender({
    element: domy.block,
    scopedNodeData: [...domy.scopedNodeData, { $createComponent }]
  });
}
