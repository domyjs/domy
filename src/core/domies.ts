import { SPECIAL_ATTRIBUTES } from '@constants/specialAttributes';
import { func } from '@utils/func';
import { AttrRendererProps } from '@typing/AttrRendererProps';
import { restoreElement } from '@utils/restoreElement';
import { VirtualDom } from './VitualDom';
import { renderElement } from './renderElement';
import { Signal } from './Signal';

export function domies(props: AttrRendererProps) {
  const domyAttrName = props.attr.name as (typeof SPECIAL_ATTRIBUTES)[number];

  props.virtualElement.$el.removeAttribute(domyAttrName);

  function getExecutedValue() {
    return func({
      code: props.attr.value,
      returnResult: true,
      $state: props.$state,
      virtualParent: props.virtualParent,
      virtualElement: props.virtualElement
    });
  }

  switch (domyAttrName) {
    case 'd-text':
      props.virtualElement.$el.textContent = getExecutedValue();
      break;
    case 'd-html':
      props.virtualElement.$el.innerHTML = getExecutedValue();
      break;
    case 'd-if':
      if (!props.virtualParent) break;

      const shouldBeDisplay = getExecutedValue();

      if (props.virtualElement.isDisplay && !shouldBeDisplay) {
        props.virtualElement.isDisplay = false;
        props.virtualElement.$el.remove();
      } else if (!props.virtualElement.isDisplay && shouldBeDisplay) {
        const newElement = VirtualDom.createElementFromVirtual(props.virtualElement);
        const visibleElements = props.virtualParent.childs.filter(
          child => typeof child === 'string' || child.isDisplay || child === props.virtualElement
        );
        const indexToInsert = visibleElements.findIndex(child => child === props.virtualElement);
        props.virtualElement.$el = newElement;
        props.virtualElement.isDisplay = true;
        renderElement(props.virtualParent, props.virtualElement);
        restoreElement(props.virtualParent.$el, newElement, indexToInsert);
      }
      break;
    case 'd-show':
      (props.virtualElement.$el as HTMLElement).style.display = getExecutedValue() ? '' : 'none';
      break;
    case 'd-ref':
      props.$state.$refs[props.attr.value] = props.virtualElement.$el;
      break;
    case 'd-model':
      // TODO
      break;
    case 'd-for':
      if (!props.virtualParent) break;

      props.virtualElement.$el.innerHTML = '';

      const forRegex = /(?<dest>\w+)(?:,\s*(?<index>\w+))?\s*(?<type>in|of)\s*(?<org>.+)/gi;

      const res = forRegex.exec(props.attr.value);

      if (!res)
        throw new Error(`Invalide "${props.attr.name}" attribute value: "${props.attr.value}"`);

      const isForIn = res.groups!.type === 'in';
      const executedValue = func({
        code: res.groups!.org,
        returnResult: true,
        $state: props.$state,
        virtualParent: props.virtualParent,
        virtualElement: props.virtualElement
      });

      let index = 0;

      function renderer(value: any) {
        for (const child of props.virtualElement.childs) {
          if (typeof child === 'string') continue; // TODO

          const toInject = res!.groups!.index
            ? [new Signal(res!.groups!.dest, value), new Signal(res!.groups!.index, index)]
            : [new Signal(res!.groups!.dest, value)];

          const newElement = VirtualDom.createElementFromVirtual(child);
          child.$el = newElement;
          renderElement(props.virtualElement, child, toInject);
          props.virtualElement.$el.appendChild(newElement);
        }

        ++index;
      }

      if (isForIn) {
        for (const value in executedValue) {
          renderer(value);
        }
      } else {
        for (const value of executedValue) {
          renderer(value);
        }
      }

      break;
  }
}
