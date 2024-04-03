import { Domy, DomyProps } from '../../types/Domy';

function dFor(domy: DomyProps) {
  const el = domy.el;
  const initialChilds = el.childNodes;

  // Remove the original content
  el.innerHTML = '';

  domy.effect(() => {
    const perf = performance.now();

    const currentChildrends = Array.from(el.children);

    const forRegex = /(?<dest>\w+)(?:,\s*(?<index>\w+))?\s*(?<type>in|of)\s*(?<org>.+)/gi;
    const res = forRegex.exec(domy.attr.value);
    if (!res)
      throw new Error(`Invalide "${domy.attr.name}" attribute value: "${domy.attr.value}".`);

    const isForIn = res.groups!.type === 'in';
    const executedValue = domy.utils.evaluate();

    const renderedChildrens: (Element | ChildNode | Node)[] = [];

    function renderer(value: any, valueIndex: number) {
      for (let childIndex = 0; childIndex < initialChilds.length; ++childIndex) {
        const child = initialChilds[childIndex] as Element;
        const currentIndex = valueIndex * initialChilds.length + childIndex;

        const toInject = res!.groups!.index
          ? domy.utils.reactive({
              [res!.groups!.dest]: value,
              [res!.groups!.index]: valueIndex
            })
          : domy.utils.reactive({
              [res!.groups!.dest]: value
            });

        // Check if the key already exist so we can skip render
        if ('key' in child && child.key) {
          const keyValue = domy.utils.evaluate({
            code: child.key,
            $state: {
              ...domy.$state,
              $state: [...toInject, ...domy.$state.$state]
            }
          });
          const elementWithKeyIndex = currentChildrends.findIndex(
            el => el.getAttribute('key') === keyValue.toString()
          );
          if (elementWithKeyIndex !== -1) {
            const elementWithKey = currentChildrends[elementWithKeyIndex];
            if (elementWithKeyIndex !== currentIndex) {
              // If the index of the element changed we move it to the new position
              domy.utils.moveElement(el, elementWithKey, currentIndex);
            }
            renderedChildrens.push(elementWithKey);
            continue;
          }
        }

        // Create and render the new element
        const newChild = child.cloneNode(true);
        // TODO: Fixe because it's really slow
        domy.utils.deepRender(newChild as Element);

        const oldRender: ChildNode | undefined = el.childNodes[currentIndex];

        // We compare if we need to replace the old rendering or not
        if (!oldRender) {
          el.appendChild(newChild);
          renderedChildrens.push(newChild);
          continue;
        }

        const isEqual = oldRender.isEqualNode(newChild);
        if (!isEqual) {
          el.insertBefore(newChild, oldRender);
          renderedChildrens.push(newChild);
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
    const childrendsToRemove = Array.from(el.childNodes ?? []).filter(
      child => !renderedChildrens.includes(child)
    );
    for (const child of childrendsToRemove) {
      child.remove();
    }

    console.log(performance.now() - perf);
  });
}

export function dForPlugin(domy: Domy) {
  domy.registerAttribute('for', dFor);
}
