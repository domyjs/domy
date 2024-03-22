type VirtualElement = {
  $el: Element;
  $oldOuterHTML: string;
  tag: string;
  attributes: {
    [name: string]: string;
  };
  childs: (VirtualElement | string)[];
};

class VirtualDom {
  private root: VirtualElement;

  constructor(el: Element) {
    this.root = this.init(el);
  }

  private init(element: Element): VirtualElement {
    const virtualElement: VirtualElement = {
      $el: element,
      $oldOuterHTML: element.outerHTML,
      tag: element.tagName.toLowerCase(),
      attributes: {},
      childs: []
    };

    // Add attributes
    Array.from(element.attributes).forEach(attr => {
      virtualElement.attributes[attr.name] = attr.value;
    });

    // Add child nodes
    element.childNodes.forEach(child => {
      if (child.nodeType === Node.ELEMENT_NODE) {
        virtualElement.childs.push(this.init(child as Element));
      } else if (child.nodeType === Node.TEXT_NODE && child.textContent?.trim()) {
        virtualElement.childs.push(child.textContent.trim());
      }
    });

    return virtualElement;
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
