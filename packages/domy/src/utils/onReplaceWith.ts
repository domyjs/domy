/**
 * Allow us to know when an element is replaced
 * @param el
 * @param cb
 *
 * @author yoannchb-pro
 */
export function onReplaceWith(el: Element, cb: (...nodes: (string | Node)[]) => void | Element) {
  const orignalReplaceWithMethod = el.replaceWith.bind(el);
  el.replaceWith = (...nodes: (string | Node)[]) => {
    orignalReplaceWithMethod(...nodes);
    cb(...nodes);
  };
}
