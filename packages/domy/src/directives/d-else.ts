import { DomyDirectiveHelper, DomyDirectiveReturn } from '../types/Domy';

/**
 * d-else implementation
 * Like like a } else { in javascript
 * The element is only rendered when displayed
 * It also handle animation
 * @param domy
 *
 * @author yoannchb-pro
 */
export function dElseImplementation(domy: DomyDirectiveHelper): DomyDirectiveReturn {
  const el = domy.el as HTMLElement;

  const allPreviousConditions = domy.utils.getPreviousConditionsElements(el, ['d-if', 'd-else-if']);

  if (allPreviousConditions.length === 0) {
    throw new Error(`"${domy.attrName}" should be preceded by "d-if" or "d-else-if" element.`);
  }

  const callback = (element: Element | Node, mutation: MutationRecord) => {
    console.log(mutation.type, allPreviousConditions.includes(element as Element));
    return (
      mutation.type === 'childList' && // Ensure the mutation is an added or removed node
      allPreviousConditions.includes(element as Element) && // Ensure the added or removed node is not a deep children but one of the conditions
      visibilityHandler()
    );
  };

  for (let i = 0; i < allPreviousConditions.length; ++i) {
    const previousCondition = allPreviousConditions[i];
    domy.onClone(previousCondition, clone => {
      console.log('clone');
      domy.utils.GlobalMutationObserver.getInstance().unwatch([previousCondition], callback);
      allPreviousConditions[i] = clone;
      domy.utils.GlobalMutationObserver.getInstance().watch([clone], callback);
      visibilityHandler();
    });
  }

  const visibilityHandler = domy.utils.getElementVisibilityHandler({
    shouldBeDisplay: () => {
      console.log('test visibility');
      const allPreviousConditionsAreDisconnected = !allPreviousConditions.find(
        el => el.isConnected
      );
      return allPreviousConditionsAreDisconnected;
    },
    disconnectAction: (element, unmount) => {
      element.remove();
      if (unmount) unmount();
      domy.utils.GlobalMutationObserver.getInstance().unwatch(allPreviousConditions, callback);
    },
    connectAction: () =>
      domy.utils.GlobalMutationObserver.getInstance().watch(allPreviousConditions, callback),
    domy
  });

  visibilityHandler();

  return { skipChildsRendering: true, skipOtherAttributesRendering: true };
}
