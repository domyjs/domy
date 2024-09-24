/**
 * Allow us to call a callback when an element is cloned
 * @param el
 * @param cb
 *
 * @author yoannchb-pro
 */
export function onClone(el: Element, cb: (clone: Element) => void | Element) {
  const orignalCloneMethod = el.cloneNode.bind(el);
  el.cloneNode = (deep?: boolean) => {
    const clone = orignalCloneMethod(deep);
    const fixedClone = cb(clone as Element);
    return fixedClone ?? clone;
  };
}
