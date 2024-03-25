/**
 * Move an element to a specific position into his parent
 * @param element
 * @param index
 * @returns
 */
export function moveElement(element: Element, index: number) {
  const parent = element.parentNode;

  if (!parent) {
    return;
  }

  const target = parent.children[index];

  if (target === element) {
    return;
  }

  parent.insertBefore(element, target);
}
