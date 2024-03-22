/**
 * Restore an element to is previous position into a parent
 * @param parent
 * @param element
 * @param index
 */
export function restoreElement(parent: Element, element: Element, index: number) {
  const referenceElement = parent.children[index];
  if (referenceElement) {
    parent.insertBefore(element, referenceElement);
  } else {
    parent.appendChild(element);
  }
}
