import { SPECIAL_ATTRIBUTES } from '@constants/specialAttributes';
import { func } from '@utils/func';
import { AttrRendererProps } from '@typing/AttrRendererProps';
import { restoreElement } from '@utils/restoreElement';
import { VirtualDom } from './VitualDom';
import { renderElement } from './renderElement';
import { Signal } from './Signal';

/**
 * Handle attributes starting by d-*
 * @param props
 * @returns
 */
export function domies(props: AttrRendererProps) {
  const $el = props.virtualElement.$el;
  const $state = props.$state;
  const domyAttrName = props.attr.name as (typeof SPECIAL_ATTRIBUTES)[number];

  $el.removeAttribute(domyAttrName);

  function getExecutedValue(code?: string, returnValue?: boolean) {
    return func({
      code: code ?? props.attr.value,
      returnResult: returnValue ?? true,
      $state: props.$state,
      virtualParent: props.virtualParent,
      virtualElement: props.virtualElement,
      notifier: props.notifier
    });
  }

  switch (domyAttrName) {
    case 'd-text':
      $el.textContent = getExecutedValue();
      break;
    case 'd-html':
      $el.innerHTML = getExecutedValue();
      break;
    case 'd-show':
      ($el as HTMLElement).style.display = getExecutedValue() ? '' : 'none';
      break;
    case 'd-ref':
      props.$state.$refs[props.attr.value] = $el;
      break;
    case 'd-effect':
      const executedValueEffect = getExecutedValue(undefined, false);
      if (typeof executedValueEffect === 'function') executedValueEffect();
      break;
    case 'd-init':
      const executedValueInit = getExecutedValue(undefined, false);
      if (typeof executedValueInit === 'function') executedValueInit();
      delete props.virtualElement.domiesAttributes['d-init'];
      break;
    case 'd-if':
      if (!props.virtualParent) break;

      const shouldBeDisplay = getExecutedValue();

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
      break;
    case 'd-model':
      const signalName = props.attr.value;
      const currentSignal = $state.$state.find(state => state.name === signalName);
      function changeValue() {
        currentSignal?.set(($el as HTMLInputElement)?.value ?? '');
      }
      $el.addEventListener('input', changeValue);
      $el.addEventListener('change', changeValue);
      break;
    case 'd-for':
      if (!props.virtualParent) break;

      $el.innerHTML = '';

      const forRegex = /(?<dest>\w+)(?:,\s*(?<index>\w+))?\s*(?<type>in|of)\s*(?<org>.+)/gi;

      const res = forRegex.exec(props.attr.value);

      if (!res)
        throw new Error(`Invalide "${props.attr.name}" attribute value: "${props.attr.value}"`);

      const isForIn = res.groups!.type === 'in';
      const executedValue = getExecutedValue(res.groups!.org);

      let index = 0;

      function renderer(value: any) {
        for (const child of props.virtualElement.childs) {
          const toInject = res!.groups!.index
            ? [new Signal(res!.groups!.dest, value), new Signal(res!.groups!.index, index)]
            : [new Signal(res!.groups!.dest, value)];

          const newElement = VirtualDom.createElementFromVirtual(child);
          if (typeof child !== 'string') {
            child.$el = newElement as Element;
            renderElement($state, props.virtualElement, child, toInject);
          }
          $el.appendChild(newElement);
        }

        ++index;
      }

      if (isForIn) {
        for (const value in executedValue) renderer(value);
      } else {
        for (const value of executedValue) renderer(value);
      }

      break;
  }
}
