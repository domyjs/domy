import { ComponentProps, Components } from '../types/Component';
import { DomyDirectiveHelper } from '../types/Domy';
import { getDomyAttributeInformations } from '../utils/domyAttrUtils';
import { isBindAttr } from '../utils/isSpecialAttribute';
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
export function renderComponent(
  domy: DomyDirectiveHelper,
  element: HTMLElement,
  component: Components[keyof Components]
) {
  // We render the childs first to ensure they keep the current state and not the component state
  for (const child of element.childNodes) {
    domy.deepRender({
      element: child as Element,
      scopedNodeData: domy.scopedNodeData
    });
  }

  const data = domy.reactive({ props: {} as ComponentProps['props'] });

  const attributes = Array.from(element.attributes).filter(attr => {
    const attrName = kebabToCamelCase(attr.name.replace(/^:/, ''));
    return component.propsName.has(attrName);
  });

  // We ensure the props are reactive
  // In particular in that kind of case: <Component :prop="var ? data1 : data2" />
  domy.effect(() => {
    for (const attr of attributes) {
      if (isBindAttr(attr.name)) {
        const attrInfos = getDomyAttributeInformations(attr);
        const propName = kebabToCamelCase(attrInfos.attrName);
        data.props[propName] = domy.evaluate(attr.value);
      } else {
        // When the attribute is empty we considere it as a true value
        // Example: <div isShow></div>
        data.props[attr.name] = attr.value === '' ? true : attr.value;
      }

      element.removeAttribute(attr.name);
    }
  });

  component.componentSetup({
    componentElement: element,
    data,
    childrens: Array.from(element.childNodes) as Element[],
    domy
  });
}
