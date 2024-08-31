/**
 * Wrap a function
 * It allow us to apply many effects to a listener
 * @param listener
 * @param wrapper
 * @returns
 *
 * @author yoannchb-pro
 */
function wrapListener(
  listener: EventListener,
  wrapper: (next: EventListener, event: Event) => void
): EventListener {
  return (event: Event) => wrapper(listener, event);
}

/**
 * Add some directives to a listener, customise options ...
 * @param props
 *
 * @author yoannchb-pro
 */
export default function on(props: {
  el: Element;
  eventName: string;
  modifiers: Set<string>;
  listener: EventListener;
  options?: AddEventListenerOptions;
}) {
  const options: AddEventListenerOptions = props.options ?? {};

  let listener = props.listener;
  let listenerTarget = props.el;

  const { el, eventName, modifiers } = props;

  if (modifiers.has('prevent'))
    listener = wrapListener(listener, (next, event) => {
      event.preventDefault();
      next(event);
    });
  if (modifiers.has('stop'))
    listener = wrapListener(listener, (next, event) => {
      event.stopPropagation();
      next(event);
    });
  if (modifiers.has('self'))
    listener = wrapListener(listener, (next, event) => {
      event.target === listenerTarget && next(event);
    });

  if (modifiers.has('passive')) options.passive = true;
  if (modifiers.has('capture')) options.capture = true;
  if (modifiers.has('once')) options.once = true;

  // We handle keys
  // Example: keydown.{enter}
  const keyReg = /^\{(?<keys>.+?)\}$/gi;
  const keyModifier = Array.from(modifiers).find(modifier => !!modifier.match(keyReg));
  if (keyModifier) {
    const keys = keyReg
      .exec(keyModifier)!
      .groups!.keys.split(',')
      .map(key => key.toLocaleLowerCase());

    listener = wrapListener(listener, (next, event) => {
      if ('key' in event && keys.find(key => key === (event.key as string).toLowerCase())) {
        next(event);
      }
    });
  }

  if (modifiers.has('away')) {
    listenerTarget = document.body;
    listener = wrapListener(listener, (next, event) => {
      if (el.isConnected && event.target !== el && !el.contains(event.target as Node)) {
        next(event);
      }
    });
  }

  listenerTarget.addEventListener(eventName, listener, options);
}
