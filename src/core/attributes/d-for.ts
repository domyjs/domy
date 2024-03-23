import { renderElement } from '@core/renderElement';
import { Signal } from '@core/Signal';
import { VirtualDom } from '@core/VitualDom';
import { AttrRendererProps } from '@typing/AttrRendererProps';
import { func } from '@utils/func';
import { replaceElement } from '@utils/replaceElement';

export function dFor(props: AttrRendererProps) {
  if (!props.virtualParent) return;

  const $el = props.virtualElement.$el;
  const $state = props.$state;

  // Remove the original content
  if (!props.virtualElement.initialised) {
    $el.innerHTML = '';
    props.virtualElement.initialised = true;
  }

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
    let childIndex = 0;

    for (const child of props.virtualElement.childs) {
      const toInject = res!.groups!.index
        ? [new Signal(res!.groups!.dest, value), new Signal(res!.groups!.index, index)]
        : [new Signal(res!.groups!.dest, value)];

      const newElement = VirtualDom.createElementFromVirtual(child);
      if (typeof child !== 'string') {
        child.$el = newElement as Element;
        renderElement($state, props.virtualElement, child, toInject);
      }

      const oldChildIndex = index * props.virtualElement.childs.length + childIndex;
      const oldRender: ChildNode | undefined = $el.childNodes[oldChildIndex];
      ++childIndex;

      // We compare if we need to replace the old rendering or not
      if (!oldRender) {
        $el.appendChild(newElement);
        continue;
      }

      const isEqual = oldRender.isEqualNode(newElement);
      if (!isEqual) replaceElement(oldRender, newElement);
    }

    ++index;
  }

  if (isForIn) {
    for (const value in executedValue) renderer(value);
  } else {
    for (const value of executedValue) renderer(value);
  }

  // Remove remaining childs that shouldn't be there
  const totalChildsRendered = index * props.virtualElement.childs.length;
  const totalChilds = $el.childNodes.length;
  if (totalChildsRendered !== totalChilds) {
    const childsToRemove = [];
    for (let i = totalChildsRendered; i < totalChilds; ++i) {
      childsToRemove.push($el.childNodes[i]);
    }
    for (const child of childsToRemove) {
      child.remove();
    }
  }
}
