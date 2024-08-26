/**
 * Restore an element to is previous position into a parent
 * @param parent
 * @param element
 * @param index
 *
 * @author yoannchb-pro
 */
export function restoreElement(parent: Element, element: Element, index: number) {
  const referenceElement = parent.childNodes[index];

  if (referenceElement) {
    parent.insertBefore(element, referenceElement);
  } else {
    parent.appendChild(element);
  }
}
