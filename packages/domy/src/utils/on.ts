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
      event.target === listenerTarget && next(event);
    });

  if (modifiers.includes('passive')) options.passive = true;
  if (modifiers.includes('capture')) options.capture = true;

  if (modifiers.includes('away')) {
    listenerTarget = document.body;
    listener = wrapListener(listener, (next, event) => {
      if (event.target !== el && !el.contains(event.target as Node)) {
        next(event);
      }
    });
  }

  if (modifiers.includes('enter')) {
    listener = wrapListener(listener, (next, event) => {
      if ('key' in event && event.key === 'Enter') {
        next(event);
      }
    });
  }

  if (modifiers.includes('once')) {
    listener = wrapListener(listener, (next, event) => {
      next(event);

      listenerTarget.removeEventListener(eventName, listener, options);
    });
  }

  // In come case we want to add a listener to an element after a click append
  // For example d-if render the other attributes after it will be display
  // So if we click on a button to show the modal then the d-if will render the @click.away
  // The problem is that the click.away will be catch because the click will be bubble to the body
  // So to ensure all events are propaged before adding the new event we make it async
  setTimeout(() => listenerTarget.addEventListener(eventName, listener, options), 0);
}
