import { deepRender } from '../deepRender';
import { Signal } from '../Signal';
import { VirtualDom, VirtualElement } from '../VitualDom';
import { AttrRendererProps } from '@domy/types';
import { func } from '../../utils/func';
import { moveElement } from '../../utils/moveElement';

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
    attrName: props.attr.name,
    returnResult: true,
    $state: props.$state,
    virtualParent: props.virtualParent,
    virtualElement: props.virtualElement,
    notifier: props.notifier
  });

  const renderedChildrens: (Element | ChildNode)[] = [];

  function renderer(value: any, valueIndex: number) {
    const childsToRender = props.virtualElement.childs;

    for (let childIndex = 0; childIndex < childsToRender.length; ++childIndex) {
      const child = childsToRender[childIndex] as VirtualElement;
      const currentIndex = valueIndex * childsToRender.length + childIndex;

      const toInject = res!.groups!.index
        ? [
            new Signal(res!.groups!.dest, value),
            new Signal(res!.groups!.index, valueIndex, false) // Don't need proxy because we don't update an index
          ]
        : [new Signal(res!.groups!.dest, value)];

      // Check if the key already exist so we can skip render
      if ('key' in child && child.key) {
        const keyValue = func({
          code: child.key,
          returnResult: true,
          $state: {
            ...props.$state,
            $state: [...toInject, ...props.$state.$state]
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
            // If the index of the element changed we move it to the new position
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
      deepRender({
        $state,
        virtualParent: props.virtualElement,
        virtualElement: childCopy,
        injectState: toInject
      });

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
