// TODO: away, enter and other touch but what about throttle and debounce ?
/**
 * Wrap a function
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

export default function on(props: {
  el: Element;
  eventName: string;
  modifiers: string[];
  listener: EventListener;
  options?: AddEventListenerOptions;
}) {
  const options: AddEventListenerOptions = props.options ?? {};

  let listener = props.listener;
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
      event.target === el && next(event);
    });

  if (modifiers.includes('passive')) options.passive = true;
  if (modifiers.includes('capture')) options.capture = true;

  if (modifiers.includes('once')) {
    listener = wrapListener(listener, (next, event) => {
      next(event);

      el.removeEventListener(eventName, listener, options);
    });
  }

  el.addEventListener(eventName, listener, options);
}
