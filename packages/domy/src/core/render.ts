import { renderText } from './renderText';
import { State } from '../types/State';
import { isNormalAttr } from '../utils/isSpecialAttribute';
import { renderAttribute } from './renderAttribute';
import { DomyHelper } from './DomyHelper';

type Props = {
  state: State;
  element: Element;
};

export function render(props: Props) {
  const domyHelper = new DomyHelper(props.element, props.state);

  // Rendering text content
  if (props.element.nodeType === Node.TEXT_NODE) {
    renderText(domyHelper.getPluginHelper());
    domyHelper.callEffect();
    return;
  }

  // Rendering attributes
  for (const attr of props.element.attributes ?? []) {
    if (!isNormalAttr(attr.name)) {
      const [attrName, ...variants] = attr.name.split('.');
      domyHelper.directive = attrName.slice(2); // We remove the prefix "d-"
      domyHelper.attr.name = attrName;
      domyHelper.attr.value = attr.value;
      domyHelper.variants = variants;
      renderAttribute(domyHelper.getPluginHelper());
      domyHelper.callEffect();
    }
  }
}
