import { Component } from '../types/Component';
import { DomyDirectiveHelper } from '../types/Domy';

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
  // TODO: Handle props
  const renderComponent = component({
    childrens: Array.from(element.childNodes)
  });
  renderComponent(element);
}
