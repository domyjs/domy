/**
 * Replace an HTML element with a new HTML element
 * @param oldElement The old element to be replaced
 * @param newElement The new element to replace with
 */
export function replaceElement(oldElement: Element, newElement: Element) {
  if (oldElement.tagName.toLowerCase() === 'html') {
    oldElement.innerHTML = newElement.innerHTML;
    Array.from(newElement.attributes).forEach(attr => {
      oldElement.setAttribute(attr.name, attr.value);
    });
  } else {
    // Replace the old element with the new element
    oldElement.parentNode?.replaceChild(newElement, oldElement);
  }
}
