/**
 * Replace an HTML element with a new HTML element
 * @param oldElement
 * @param newElement
 *
 * @author yoannchb-pro
 */
export function replaceElement(oldNode: Node, newNode: Node) {
  if (oldNode.nodeType === Node.ELEMENT_NODE && oldNode.nodeName.toLowerCase() === 'html') {
    const oldElement = oldNode as Element;
    const newElement = newNode as Element;

    oldElement.innerHTML = newElement.innerHTML;

    for (const attr of newElement.attributes) {
      oldElement.setAttribute(attr.name, attr.value);
    }
  } else {
    oldNode.parentNode?.replaceChild(newNode, oldNode);
  }
}
