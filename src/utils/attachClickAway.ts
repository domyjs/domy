/**
 * Dispatch clickAway event when a click away from the element is triggered
 * @param element
 */
export function attachClickAway(element: Element) {
  const clickAwayListener: EventListenerOrEventListenerObject = event => {
    // If the element doesnt exist anymore we remove the event listener
    if (!element.isConnected) {
      document.removeEventListener('click', clickAwayListener);
      return;
    }

    if (event.target !== element && !element.contains(event.target as Node)) {
      element.dispatchEvent(new CustomEvent('clickAway', { bubbles: true, composed: true }));
    }
  };

  // We have a setTimeout in case the click away is added by a click
  // So we wait the event propagation before adding the event
  setTimeout(() => {
    document.addEventListener('click', clickAwayListener);
  }, 0);
}
