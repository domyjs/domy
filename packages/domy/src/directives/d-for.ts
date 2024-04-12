import { DomyDirectiveHelper, DomyDirectiveReturn } from '../types/Domy';
import { warn } from '../utils/logs';
import { moveElement } from '../utils/moveElement';

/**
 * d-for implementation
 * @param domy
 *
 * @author yoannchb-pro
 */
export function dForImplementation(domy: DomyDirectiveHelper): DomyDirectiveReturn {
  const el = domy.el;
  const initialChilds = Array.from(el.children);

  // Remove the original content
  el.innerHTML = '';

  domy.effect(() => {
    const currentChildrens = Array.from(el.children);

    const forRegex = /(?<dest>\w+)(?:,\s*(?<index>\w+))?\s+(?<type>in|of)\s+(?<org>.+)/gi;
    const res = forRegex.exec(domy.attr.value);

    if (!res)
      throw new Error(`Invalide "${domy.attr.name}" attribute value: "${domy.attr.value}".`);

    const isForIn = res.groups!.type === 'in';
    const executedValue = domy.evaluate(res.groups!.org);

    const renderedChildrens: (Element | ChildNode | Node)[] = [];

    function renderer(value: any, valueIndex: number) {
      for (let childIndex = 0; childIndex < initialChilds.length; ++childIndex) {
        const initialChild = initialChilds[childIndex] as Element;
        const currentIndex = valueIndex * initialChilds.length + childIndex;

        // Inject the new datas like index
        const scopes: Record<string, any>[] = [
          {
            [res!.groups!.dest]: value
          }
        ];

        if (res!.groups?.index) {
          scopes.push({
            [res!.groups.index]: valueIndex
          });
        }

        for (const scope of scopes) {
          domy.addScopeToNode(scope);
        }

        const keyAttr = initialChild.getAttribute(':key');
        if (keyAttr) {
          // Check if the key already exist so we can skip render
          const keyValue = domy.evaluateWithoutListening(keyAttr);
          const elementWithKeyIndex = currentChildrens.findIndex(
            el => el.getAttribute('key') === keyValue.toString()
          );

          if (elementWithKeyIndex !== -1) {
            const elementWithKey = currentChildrens[elementWithKeyIndex];
            if (elementWithKeyIndex !== currentIndex) {
              // If the index of the element changed we move it to the new position
              moveElement(el, elementWithKey, currentIndex);
            }
            renderedChildrens.push(elementWithKey);
            continue;
          }
        } else {
          warn('Elements inside a d-for parent should be rendered with :key attribute.');
        }

        // Create and render the new element
        const newChild = initialChild.cloneNode(true);
        domy.deepRender({
          element: newChild as Element,
          state: domy.state,
          scopedNodeData: domy.scopedNodeData
        });

        for (const scope of scopes) {
          domy.removeScopeToNode(scope);
        }

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
  });

  return { skipChildsRendering: true };
}
