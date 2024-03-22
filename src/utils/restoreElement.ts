export function restoreElement(parent: Element, element: Element, index: number) {
  const referenceElement = parent.children[index];
  if (referenceElement) {
    parent.insertBefore(element, referenceElement);
  } else {
    parent.appendChild(element);
  }
}
