import { deepRender } from '@core/deepRender';
import { Signal } from '@core/Signal';
import { VirtualDom, VirtualElement } from '@core/VitualDom';
import { AttrRendererProps } from '@typing/AttrRendererProps';
import { func } from '@utils/func';
import { moveElement } from '@utils/moveElement';

export function dFor(props: AttrRendererProps) {
  if (!props.virtualParent) return;

  const perf = performance.now();

  const $el = props.virtualElement.$el;
  const $state = props.$state;
  const oldChilds = Array.from($el.children ?? []);

  // Remove the original content
  if (!props.virtualElement.initialised) {
    $el.innerHTML = '';
    props.virtualElement.initialised = true;
  }

  const forRegex = /(?<dest>\w+)(?:,\s*(?<index>\w+))?\s*(?<type>in|of)\s*(?<org>.+)/gi;
  const res = forRegex.exec(props.attr.value);
  if (!res)
    throw new Error(`Invalide "${props.attr.name}" attribute value: "${props.attr.value}".`);

  const isForIn = res.groups!.type === 'in';
  const executedValue = func({
    code: res.groups!.org,
    returnResult: true,
    $state: props.$state,
    virtualParent: props.virtualParent,
    virtualElement: props.virtualElement,
    notifier: props.notifier
  });

  const renderedChildrens: (Element | ChildNode)[] = [];

  function renderer(value: any, valueIndex: number) {
    for (let childIndex = 0; childIndex < props.virtualElement.childs.length; ++childIndex) {
      const child = props.virtualElement.childs[childIndex] as VirtualElement;
      const currentIndex = valueIndex * props.virtualElement.childs.length + childIndex;

      const toInject = res!.groups!.index
        ? [
            new Signal(res!.groups!.dest, value),
            new Signal(res!.groups!.index, valueIndex, false) // Don't need proxy because we don't update an index
          ]
        : [new Signal(res!.groups!.dest, value)];

      // Check if the key already exist to we can skip render
      if ('key' in child && child.key) {
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
          el => el.getAttribute('key') === keyValue.toString()
        );
        if (elementWithKeyIndex !== -1) {
          const elementWithKey = oldChilds[elementWithKeyIndex];
          if (elementWithKeyIndex !== currentIndex) {
            // If the index of the element changed we move it to is new position
            moveElement($el, elementWithKey, currentIndex);
          }
          renderedChildrens.push(elementWithKey);
          continue;
        }
      }

      // Create and render the new element
      const childCopy = VirtualDom.createCopyOfVirtual(child);
      const newElement = VirtualDom.createElementFromVirtual(childCopy) as Element;
      // TODO: Fixe because it's really slow
      deepRender($state, props.virtualElement, childCopy, toInject);

      if ('key' in childCopy) child.key = childCopy.key;

      const oldRender: ChildNode | undefined = $el.childNodes[currentIndex];

      // We compare if we need to replace the old rendering or not
      if (!oldRender) {
        $el.appendChild(newElement);
        renderedChildrens.push(newElement);
        continue;
      }

      const isEqual = oldRender.isEqualNode(newElement);
      if (!isEqual) {
        $el.insertBefore(newElement, oldRender);
        renderedChildrens.push(newElement);
      } else {
        renderedChildrens.push(oldRender);
      }
    }
  }

  let valueIndex = 0;
  if (isForIn) {
    for (const value in executedValue) {
      renderer(value, valueIndex);
      ++valueIndex;
    }
  } else {
    for (const value of executedValue) {
      renderer(value, valueIndex);
      ++valueIndex;
    }
  }

  // Remove remaining childs that shouldn't be there
  const childrendsToRemove = Array.from($el.children ?? []).filter(
    child => !renderedChildrens.includes(child)
  );
  for (const child of childrendsToRemove) {
    child.remove();
  }

  console.log(performance.now() - perf);
}
