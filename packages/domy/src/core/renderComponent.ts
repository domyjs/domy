import { Component } from '../types/Component';
import { DomyDirectiveHelper } from '../types/Domy';
import { getDomyAttributeInformations } from '../utils/domyAttrUtils';
import { isBindAttr, isDomyAttr, isNormalAttr } from '../utils/isSpecialAttribute';

/**
 * Allow to render a component defined with createComponent
 * It will pass all necessary props
 * Example:
 * <Counter :count="count" />
 * @param element
 * @param component
 *
 * @author yoannchb-pro
 */
export function renderComponent(
  domy: DomyDirectiveHelper,
  element: HTMLElement,
  component: Component<any>
) {
  // We render the childs first to ensure they keep the current state and not the component state
  for (const child of element.childNodes) {
    domy.deepRender({
      element: child as Element,
      scopedNodeData: domy.scopedNodeData
    });
  }

  const data = domy.reactive({ props: {} as any });

  // We ensure the props are reactive
  // In particular in that kind of case: <Component :prop="var ? data1 : data2" />
  const attributes = Array.from(element.attributes);
  domy.effect(() => {
    for (const attr of attributes) {
      if (isBindAttr(attr.name)) {
        const propName = getDomyAttributeInformations(attr).attrName;
        data.props[propName] = domy.evaluate(attr.value);
        element.removeAttribute(attr.name);
      } else if (isNormalAttr(attr.name)) {
        data.props[attr.name] = attr.value;
        element.removeAttribute(attr.name);
      } else if (isDomyAttr(attr.name)) {
        // We remove the domy directive/prefix because we don't handle it for now
        element.removeAttribute(attr.name);
      }
    }
  });

  const renderComponent = component(data, Array.from(element.childNodes) as Element[]);
  renderComponent(element); // Replace the component with the render
}
