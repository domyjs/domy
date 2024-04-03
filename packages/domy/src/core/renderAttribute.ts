type Props = {};

/**
 * Render an attribute
 * @param name
 * @param value
 * @returns
 */
function renderAttribute(props: Props) {
  // Check if we have to bypass this attribute or not
  if (props.byPassAttributes && props.byPassAttributes.includes(name)) return;

  // If the element is not displayed we don't need to render the differents attributes (except if it's d-if)
  if (name !== 'd-if' && !props.virtualElement.isDisplay) return;

  const attr = { name, value };

  const propsFn: AttrRendererProps = {
    $state: {
      ...props.$state,
      $state: [...(props.injectState ?? []), ...props.$state.$state]
    },
    virtualParent: props.virtualParent,
    virtualElement: props.virtualElement,
    attr,
    notifier: () =>
      renderElement({
        $state: props.$state,
        attr,
        virtualParent: props.virtualParent,
        virtualElement: props.virtualElement,
        injectState: props.injectState
      })
  };

  if (isBindAttr(name)) {
    binding(propsFn);
  } else if (isEventAttr(name)) {
    events(propsFn);
  } else if (isDomyAttr(name)) {
    domies(propsFn);
  }
}
