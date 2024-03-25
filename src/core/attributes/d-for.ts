import { deepRender } from '@core/deepRender';
import { Signal } from '@core/Signal';
import { VirtualDom } from '@core/VitualDom';
import { AttrRendererProps } from '@typing/AttrRendererProps';
import { func } from '@utils/func';
import { moveElement } from '@utils/moveElement';
import { replaceElement } from '@utils/replaceElement';
import { restoreElement } from '@utils/restoreElement';

export function dFor(props: AttrRendererProps) {
  if (!props.virtualParent) return;

  const $el = props.virtualElement.$el;
  const $state = props.$state;
  // We remove text because it's to heavy due to the fact we can't put key on it
  const childsWithoutText = props.virtualElement.childs.filter(el => !('content' in el));

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

    for (const child of childsWithoutText) {
      const oldChildIndex = index * props.virtualElement.childs.length + childIndex;

      // TODO: We don't need to setup the proxy because the value should be edited ? (try with this.el.test = 'hello')
      const toInject = res!.groups!.index
        ? [
            new Signal(res!.groups!.dest, value, false),
            new Signal(res!.groups!.index, index, false)
          ]
        : [new Signal(res!.groups!.dest, value, false)];

      // Check if the key already exist to we can skip render
      if ('key' in child && child.key) {
        const oldChilds = Array.from($el.children ?? []);
        const keyValue = func({
          code: child.key,
          returnResult: true,
          $state: {
            ...props.$state,
            $state: [...props.$state.$state, ...toInject]
          },
          virtualElement: props.virtualElement,
          virtualParent: props.virtualParent
        });
        const elementWithKeyIndex = oldChilds.findIndex(
          el => el.getAttribute('key') === new String(keyValue).toString()
        );
        if (elementWithKeyIndex !== -1) {
          if (elementWithKeyIndex !== oldChildIndex) {
            // If the index of the element changed we move it to is new position
            const elementWithKey = oldChilds[elementWithKeyIndex];
            moveElement(elementWithKey, oldChildIndex);
          }
          ++index;
          continue;
        }
      }

      console.log('render');

      // Create and render the new element
      const newElement = VirtualDom.createElementFromVirtual(child);
      child.$el = newElement as Element;
      deepRender($state, props.virtualElement, child, toInject);

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
