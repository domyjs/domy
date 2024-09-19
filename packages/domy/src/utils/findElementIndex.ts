/**
 * Find where to insert the element
 * @returns
 *
 * @author yoannchb-pro
 */
export function findElementIndex(parentChilds: ChildNode[], el: Element): number {
  let index = 0;
  for (const child of parentChilds) {
    if (child === el) break;
    if (child.isConnected) ++index;
  }
  return index;
}
