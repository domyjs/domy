/**
 * Move an element to a specific position into his parent
 * @param element
 * @param index
 * @returns
 */
export function moveElement(parent: Element, element: Element, index: number) {
  const target = parent.children[index];

  if (target === element) {
    return;
  }

  parent.insertBefore(element, target);
}
