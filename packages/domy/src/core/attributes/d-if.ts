import { deepRender } from '../deepRender';
import { VirtualDom } from '../VitualDom';
import { AttrRendererProps } from '@domy/types';
import { findElementIndex } from '../../utils/findElementIndex';
import { func } from '../../utils/func';
import { restoreElement } from '../../utils/restoreElement';

export function dIf(props: AttrRendererProps) {
  if (!props.virtualParent) return;

  const $el = props.virtualElement.$el;
  const $state = props.$state;

  const shouldBeDisplay = func({
    code: props.attr.value,
    attrName: props.attr.name,
    returnResult: true,
    $state: props.$state,
    virtualParent: props.virtualParent,
    virtualElement: props.virtualElement,
    notifier: props.notifier
  });

  const transitionName = props.virtualElement.domiesAttributes['d-transition'];
  const hasTransition = typeof transitionName === 'string';

  const transitionOutListener: EventListenerOrEventListenerObject = () => {
    $el.remove();
    $el.removeEventListener('transitionend', transitionOutListener);
    $el.removeEventListener('animationend', transitionOutListener);
  };

  if (props.virtualElement.isDisplay && !shouldBeDisplay) {
    props.virtualElement.isDisplay = false;

    // Handle out transition
    if (hasTransition && props.virtualElement.initialised) {
      $el.classList.add(`${transitionName}-out`);
      $el.addEventListener('animationend', transitionOutListener);
      $el.addEventListener('transition', transitionOutListener);
    } else {
      $el.remove();
    }
  } else if (!props.virtualElement.isDisplay && shouldBeDisplay) {
    const newElement = VirtualDom.createElementFromVirtual(props.virtualElement) as Element;
    const indexToInsert = findElementIndex(props.virtualParent, props.virtualElement);
    props.virtualElement.isDisplay = true;

    // Handle enter transition
    if (hasTransition) newElement.classList.add(`${transitionName}-enter`);

    // Handle the case the old element is not remove yet because of the out animation for example
    if ($el.isConnected) $el.remove();

    deepRender({
      $state,
      virtualParent: props.virtualParent,
      virtualElement: props.virtualElement,
      byPassAttributes: ['d-if']
    });
    restoreElement(props.virtualParent.$el, newElement, indexToInsert);
  }

  props.virtualElement.initialised = true;
}
