import { isNormalAttr } from '@utils/isSpecialAttribute';

export type VirtualElement = {
  $el: Element;
  $firstState: Omit<VirtualElement, '$el' | '$firstState'>;
  tag: string;
  attributes: {
    [name: string]: string;
  };
  childs: (VirtualElement | string)[];
};

export class VirtualDom {
  private root: VirtualElement;

  constructor(el: Element) {
    this.root = this.init(el);
  }

  private init(element: Element): VirtualElement {
    const virtualElement: Omit<VirtualElement, '$firstState' | '$el'> = {
      tag: element.tagName.toLowerCase(),
      attributes: {},
      childs: []
    };

    // Add attributes
    for (const attr of Array.from(element.attributes)) {
      virtualElement.attributes[attr.name] = attr.value;
    }

    // Add child nodes
    for (const child of element.childNodes) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        virtualElement.childs.push(this.init(child as Element));
      } else if (child.nodeType === Node.TEXT_NODE && child.textContent?.trim()) {
        virtualElement.childs.push(child.textContent.trim());
      }
    }

    // We remove domy attributes like @click, :class, d-data ...
    const attributesWithoutDomy = Object.keys(virtualElement.attributes)
      .filter(attrName => isNormalAttr(attrName))
      .map(attrName => ({ [attrName]: virtualElement.attributes[attrName] }))
      .reduce((a, b) => ({ ...b, ...a }), {});

    return {
      $el: element,
      ...virtualElement,
      attributes: attributesWithoutDomy,
      $firstState: { ...virtualElement }
    };
  }

  public static createElementFromVirtual(virtualElement: VirtualElement): Element {
    const element = document.createElement(virtualElement.tag);

    // Set attributes
    for (const attrName of Object.keys(virtualElement.attributes)) {
      element.setAttribute(attrName, virtualElement.attributes[attrName]);
    }

    // Add child nodes
    for (const child of virtualElement.childs) {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else {
        element.appendChild(VirtualDom.createElementFromVirtual(child));
      }
    }

    return element;
  }

  visit(cb: (el: VirtualElement | string) => void) {
    const childs: (VirtualElement | string)[] = [this.root];
    while (childs.length > 0) {
      const element = childs.shift() as VirtualElement | string;
      cb(element);
      if (typeof element !== 'string') childs.push(...element.childs);
    }
  }
}
