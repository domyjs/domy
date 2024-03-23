import { renderElement } from '@core/renderElement';
import { VirtualDom } from '@core/VitualDom';
import { AttrRendererProps } from '@typing/AttrRendererProps';
import { func } from '@utils/func';
import { restoreElement } from '@utils/restoreElement';

export function dIf(props: AttrRendererProps) {
  if (!props.virtualParent) return;

  const $el = props.virtualElement.$el;
  const $state = props.$state;

  const shouldBeDisplay = func({
    code: props.attr.value,
    returnResult: true,
    $state: props.$state,
    virtualParent: props.virtualParent,
    virtualElement: props.virtualElement,
    notifier: props.notifier
  });

  if (props.virtualElement.isDisplay && !shouldBeDisplay) {
    props.virtualElement.isDisplay = false;
    $el.remove();
  } else if (!props.virtualElement.isDisplay && shouldBeDisplay) {
    const newElement = VirtualDom.createElementFromVirtual(props.virtualElement) as Element;
    const visibleElements = props.virtualParent.childs.filter(
      child => typeof child === 'string' || child.isDisplay || child === props.virtualElement
    );
    const indexToInsert = visibleElements.findIndex(child => child === props.virtualElement);
    props.virtualElement.$el = newElement;
    props.virtualElement.isDisplay = true;
    renderElement($state, props.virtualParent, props.virtualElement, [], ['d-if']);
    restoreElement(props.virtualParent.$el, newElement, indexToInsert);
  }
}
