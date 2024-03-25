import { deepRender } from '@core/deepRender';
import { VirtualDom } from '@core/VitualDom';
import { AttrRendererProps } from '@typing/AttrRendererProps';
import { findElementIndex } from '@utils/findElementIndex';
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
    const indexToInsert = findElementIndex(props.virtualParent, props.virtualElement);
    props.virtualElement.isDisplay = true;
    deepRender($state, props.virtualParent, props.virtualElement, [], ['d-if']);
    restoreElement(props.virtualParent.$el, newElement, indexToInsert);
  }
}
