import { Component, ComponentProps } from '../types/Component';
import { DomyDirectiveHelper } from '../types/Domy';
import { getDomyAttributeInformations } from '../utils/domyAttrUtils';
import { isBindAttr, isEventAttr, isNormalAttr } from '../utils/isSpecialAttribute';
import { kebabToCamelCase } from '../utils/kebabToCamelCase';

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
export async function renderComponent(
  domy: DomyDirectiveHelper,
  element: HTMLElement,
  component: Component
) {
  // We render the childs first to ensure they keep the current state and not the component state
  for (const child of element.childNodes) {
    domy.deepRender({
      element: child as Element,
      scopedNodeData: domy.scopedNodeData
    });
  }

  const data = domy.reactive({ props: {} as ComponentProps['props'] });

  // We ensure the props are reactive
  // In particular in that kind of case: <Component :prop="var ? data1 : data2" />
  const attributes = Array.from(element.attributes);
  domy.effect(() => {
    for (const attr of attributes) {
      if (isBindAttr(attr.name) || isEventAttr(attr.name)) {
        const attrInfos = getDomyAttributeInformations(attr);
        const propName = kebabToCamelCase(attrInfos.attrName);
        // When the attribute is empty we considere it as a true value
        // Example: <div isShow></div>
        data.props[propName] = attr.value === '' ? true : domy.evaluate(attr.value);
      } else if (isNormalAttr(attr.name)) {
        data.props[attr.name] = attr.value;
      }

      element.removeAttribute(attr.name);
    }
  });

  await component(element, data, Array.from(element.childNodes) as Element[]);
}
