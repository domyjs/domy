import { isNormalAttr } from '@utils/isSpecialAttribute';

type VisitCallback = (
  virtualParent: VirtualElement | null,
  virtualElement: VirtualElement | VirtualText
) => void;

export type VirtualText = {
  $el: Text;
  isDisplay: boolean;
  visited: boolean;
  content: string;
};

export type VirtualElement = {
  $el: Element;
  key?: string;
  tag: string;
  isDisplay: boolean;
  visited: boolean;
  events: Record<string, EventListenerOrEventListenerObject>;
  initialised: boolean;
  domiesAttributes: {
    [name: string]: string;
  };
  normalAttributes: {
    [name: string]: string;
  };
  childs: (VirtualElement | VirtualText)[];
};

export class VirtualDom {
  private root: (VirtualElement | VirtualText)[];

  constructor(els: Element[]) {
    this.root = this.init(els);
  }

  init(els: Element[]): (VirtualElement | VirtualText)[] {
    const virtualElements: (VirtualElement | VirtualText)[] = [];
    for (const el of els) {
      virtualElements.push(this.getVirtual(el));
    }
    return virtualElements;
  }

  private getVirtual(element: Text | Element): VirtualText | VirtualElement {
    if (element.nodeType === Node.TEXT_NODE) {
      return this.getVirtualText(element as Text);
    }

    return this.getVirtualElement(element as Element);
  }

  private getVirtualText(element: Text): VirtualText {
    const virtualText: VirtualText = {
      $el: element,
      isDisplay: true,
      visited: false,
      content: element.textContent ?? ''
    };
    return virtualText;
  }

  private getVirtualElement(element: Element): VirtualElement {
    const tag = element.tagName?.toLocaleLowerCase() ?? 'comment';
    const isTemplate = tag === 'template';

    const virtualElement: VirtualElement = {
      $el: element,
      tag,
      isDisplay: true,
      visited: false,
      initialised: false,
      events: {},
      domiesAttributes: {},
      normalAttributes: {},
      childs: []
    };

    // Add attributes
    for (const attr of Array.from(element.attributes ?? [])) {
      if (isNormalAttr(attr.name)) {
        virtualElement.normalAttributes[attr.name] = attr.value;
      } else {
        virtualElement.domiesAttributes[attr.name] = attr.value;
      }
    }

    // Add child nodes
    const elementChilds = isTemplate
      ? (element as HTMLTemplateElement).content.childNodes
      : element.childNodes;
    for (const child of elementChilds) {
      virtualElement.childs.push(this.getVirtual(child as Text | Element));
    }

    return virtualElement;
  }

  public static createElementFromVirtual(
    virtualElement: VirtualElement | VirtualText
  ): Element | Text {
    // If it's textContent
    if ('content' in virtualElement) return document.createTextNode(virtualElement.content);

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

  visitFrom(element: VirtualElement | VirtualText, cb: VisitCallback) {
    const stack: { parent: VirtualElement | null; childs: (VirtualElement | VirtualText)[] }[] = [
      { parent: null, childs: [element] }
    ];

    while (stack.length > 0) {
      const { parent, childs } = stack[stack.length - 1];

      if (childs.length === 0) {
        stack.pop();
        continue;
      }

      const element = childs.shift() as VirtualElement | VirtualText;
      const isText = 'content' in element;

      const shouldBeVisit =
        !isText &&
        typeof element.domiesAttributes['d-ignore'] !== 'string' &&
        typeof parent?.domiesAttributes['d-for'] !== 'string';
      if (!isText && !shouldBeVisit) continue;

      element.visited = true;
      cb(parent, element);

      if (!isText) stack.push({ parent: element, childs: [...element.childs] });
    }
  }

  visit(cb: VisitCallback) {
    for (const el of this.root) {
      this.visitFrom(el, cb);
    }
  }
}
