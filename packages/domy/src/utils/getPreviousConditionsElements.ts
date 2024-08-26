/**
 * Return the list of previous conditions elements before an element
 * Useful for d-else and d-else-if directives
 * @param element
 * @param previousAuthorizedAttrs
 * @returns
 *
 * @author yoannchb-pro
 */
export function getPreviousConditionsElements(
  element: HTMLElement,
  previousAuthorizedAttrs: string[]
) {
  const previousSibling = element.previousElementSibling;

  if (!previousSibling) return [];

  const allPreviousConditions: Element[] = [previousSibling];

  while (true) {
    const currentPreviousSibling =
      allPreviousConditions[allPreviousConditions.length - 1].previousElementSibling;

    if (!currentPreviousSibling) {
      break;
    }

    let isValid = false;
    for (const previousAuthorizedAttr of previousAuthorizedAttrs) {
      if (currentPreviousSibling.getAttribute(previousAuthorizedAttr)) isValid = true;
    }
    if (!isValid) break;

    allPreviousConditions.push(currentPreviousSibling as Element);
  }

  return allPreviousConditions;
}
