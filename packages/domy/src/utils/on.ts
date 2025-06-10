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
  modifiers: string[];
  listener: EventListener;
  options?: AddEventListenerOptions;
}) {
  const options: AddEventListenerOptions = props.options ?? {};

  let listener = props.listener;
  let listenerTarget = props.el;

  const { el, eventName, modifiers } = props;

  if (modifiers.includes('prevent'))
    listener = wrapListener(listener, (next, event) => {
      event.preventDefault();
      next(event);
    });
  if (modifiers.includes('stop'))
    listener = wrapListener(listener, (next, event) => {
      event.stopPropagation();
      next(event);
    });
  if (modifiers.includes('self'))
    listener = wrapListener(listener, (next, event) => {
      if (event.target === listenerTarget) next(event);
    });

  if (modifiers.includes('passive')) options.passive = true;
  if (modifiers.includes('capture')) options.capture = true;
  if (modifiers.includes('once')) options.once = true;

  // We handle keys
  // Example: keydown.{enter}
  const keyReg = /^\{(?<keys>.+?)\}$/gi;
  const keyModifier = modifiers.find(modifier => !!modifier.match(keyReg));
  if (keyModifier) {
    const keys = keyReg
      .exec(keyModifier)!
      .groups!.keys.split(',')
      .map(key => key.toLocaleLowerCase());

    listener = wrapListener(listener, (next, event) => {
      if ('key' in event && keys.find(key => key === (event.key as string).toLowerCase())) {
        event.preventDefault(); // Ensure the pressed key is not happened to the input value
        next(event);
      }
    });
  }

  if (modifiers.includes('away')) {
    listenerTarget = document.body;
    listener = wrapListener(listener, (next, event) => {
      if (event.target !== el && !el.contains(event.target as Node)) {
        next(event);
      }
    });
  }

  return {
    listenerTarget,
    eventName,
    listener,
    options
  };
}
