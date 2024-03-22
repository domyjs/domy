import { isNormalAttr } from '@utils/isSpecialAttribute';

type VisitCallback = (
  virtualParent: VirtualElement | null,
  virtualElement: VirtualElement | string
) => void;

export type VirtualElement = {
  $el: Element;
  tag: string;
  isDisplay: boolean;
  visited: boolean;
  events: Record<string, EventListenerOrEventListenerObject>;
  domiesAttributes: {
    [name: string]: string;
  };
  normalAttributes: {
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
    const virtualElement: VirtualElement = {
      $el: element,
      tag: element.tagName.toLowerCase(),
      isDisplay: true,
      visited: false,
      events: {},
      domiesAttributes: {},
      normalAttributes: {},
      childs: []
    };

    // Add attributes
    for (const attr of Array.from(element.attributes)) {
      if (isNormalAttr(attr.name)) {
        virtualElement.normalAttributes[attr.name] = attr.value;
      } else {
        virtualElement.domiesAttributes[attr.name] = attr.value;
      }
    }

    // Add child nodes
    for (const child of element.childNodes) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        virtualElement.childs.push(this.init(child as Element));
      } else if (child.nodeType === Node.TEXT_NODE && child.textContent?.trim()) {
        virtualElement.childs.push(child.textContent.trim());
      }
    }

    return virtualElement;
  }

  public static createElementFromVirtual(virtualElement: VirtualElement | string): Element | Text {
    // If it's textContent
    if (typeof virtualElement === 'string') return document.createTextNode(virtualElement);

    const element = document.createElement(virtualElement.tag);

    // Set attributes
    for (const attrName of Object.keys(virtualElement.normalAttributes)) {
      element.setAttribute(attrName, virtualElement.normalAttributes[attrName]);
    }

    // Add child nodes
    for (const child of virtualElement.childs) {
      element.appendChild(VirtualDom.createElementFromVirtual(child));
    }

    return element;
  }

  visitFrom(element: VirtualElement | string, cb: VisitCallback) {
    const stack: { parent: VirtualElement | null; childs: (VirtualElement | string)[] }[] = [
      { parent: null, childs: [element] }
    ];

    while (stack.length > 0) {
      const { parent, childs } = stack[stack.length - 1];

      if (childs.length === 0) {
        stack.pop();
        continue;
      }

      const element = childs.shift() as VirtualElement | string;
      const shouldBeVisit =
        typeof element !== 'string' &&
        typeof element.domiesAttributes['d-ignore'] !== 'string' &&
        typeof parent?.domiesAttributes['d-for'] !== 'string';
      if (!shouldBeVisit) continue;
      element.visited = true;
      cb(parent, element);

      stack.push({ parent: element, childs: [...element.childs] });
    }
  }

  visit(cb: VisitCallback) {
    this.visitFrom(this.root, cb);
  }
}
