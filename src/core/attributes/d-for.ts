import { renderElement } from '@core/renderElement';
import { Signal } from '@core/Signal';
import { VirtualDom } from '@core/VitualDom';
import { AttrRendererProps } from '@typing/AttrRendererProps';
import { func } from '@utils/func';

export function dFor(props: AttrRendererProps) {
  if (!props.virtualParent) return;

  const $el = props.virtualElement.$el;
  const $state = props.$state;

  $el.innerHTML = '';

  const forRegex = /(?<dest>\w+)(?:,\s*(?<index>\w+))?\s*(?<type>in|of)\s*(?<org>.+)/gi;

  const res = forRegex.exec(props.attr.value);

  if (!res) throw new Error(`Invalide "${props.attr.name}" attribute value: "${props.attr.value}"`);

  const isForIn = res.groups!.type === 'in';
  const executedValue = func({
    code: res.groups!.org,
    returnResult: true,
    $state: props.$state,
    virtualParent: props.virtualParent,
    virtualElement: props.virtualElement,
    notifier: props.notifier
  });

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
}
