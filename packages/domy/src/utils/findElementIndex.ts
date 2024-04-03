import { VirtualElement, VirtualText } from '../core/VitualDom';

/**
 * Find the current position of a virtual element into his parent
 * @param virtualParent
 * @param virtualElement
 * @return
 */
export function findElementIndex(
  virtualParent: VirtualElement,
  virtualElement: VirtualElement | VirtualText
) {
  const visibleElements = virtualParent.childs.filter(
    child => typeof child === 'string' || child.isDisplay || child === virtualElement
  );
  const index = visibleElements.findIndex(child => child === virtualElement);
  return index;
}
