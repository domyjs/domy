import { DomyDirectiveHelper, DomyDirectiveReturn } from '../types/Domy';
import { warn } from '../utils/logs';

type RendererProps = {
  value: any;
  valueIndex: number;
  initialChilds: Element[];
  domy: DomyDirectiveHelper;
  forPattern: RegExpExecArray;
};

/**
 * Render the childs in d-for element for a specific value and index
 * @param props
 * @returns
 *
 * @author yoannchb-pro
 */
function renderer(props: RendererProps) {
  const domy = props.domy;
  const el = domy.el;
  const currentChildrens = Array.from(el.children);
  const renderedChildrens = new Map<Element | ChildNode | Node, boolean>();

  // Add the value to the scope
  let scope = {
    [props.forPattern!.groups!.dest]: props.value
  };
  // Add the index to the scope if needed
  if (props.forPattern!.groups?.index) {
    scope = {
      ...scope,
      [props.forPattern!.groups.index]: props.valueIndex
    };
  }

  domy.addScopeToNode(scope);

  for (let childIndex = 0; childIndex < props.initialChilds.length; ++childIndex) {
    const initialChild = props.initialChilds[childIndex] as Element;
    const currentIndex = props.valueIndex * props.initialChilds.length + childIndex;

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
          domy.utils.moveElement(el, elementWithKey, currentIndex);
        }

        renderedChildrens.set(elementWithKey, false);
        continue;
      }
    }

    // Create and render the new element
    const newChild = initialChild.cloneNode(true);
    el.appendChild(newChild);
    renderedChildrens.set(newChild, true);
  }

  return renderedChildrens;
}

/**
 * d-for implementation
 * Allow to render a list of element
 * It act like a for in javascript
 * @param domy
 *
 * @author yoannchb-pro
 */
export function dForImplementation(domy: DomyDirectiveHelper): DomyDirectiveReturn {
  const el = domy.el;
  const initialChilds = Array.from(el.children);
  const renderedChildrens = new Map<Element | ChildNode | Node, () => void>();

  // Display a warning message if the childrens don't have a :key attribute
  for (const child of initialChilds) {
    if (!child.getAttribute(':key')) {
      warn('Elements inside a d-for parent should be rendered with :key attribute.');
      break;
    }
  }

  // Remove the original content
  el.innerHTML = '';

  domy.effect(() => {
    const forRegex = /(?<dest>\w+)(?:,\s*(?<index>\w+))?\s+(?<type>in|of)\s+(?<org>.+)/gi;
    const forPattern = forRegex.exec(domy.attr.value);

    if (!forPattern)
      throw new Error(`Invalide "${domy.attr.name}" attribute value: "${domy.attr.value}".`);

    const isForIn = forPattern.groups!.type === 'in';
    const executedValue = domy.evaluate(forPattern.groups!.org);

    let valueIndex = 0;
    const renderedChildrensForCurrentRender = new Set<Element | ChildNode | Node>();

    const renderChilds = (value: any) => {
      const renderedChildForCurrentValue = renderer({
        domy,
        forPattern,
        initialChilds,
        value,
        valueIndex
      });

      const renderedChildrens = new Map<Element | ChildNode | Node, () => void>();
      for (const [element, needMount] of renderedChildForCurrentValue.entries()) {
        if (needMount) {
          let newElements = [element as Element];

          domy.onClone(newElements[0], clone => {
            newElements[0] = clone;
          });

          domy.onReplaceWith(newElements[0], (...nodes) => {
            newElements = nodes as Element[];
          });

          const unmount = domy.deepRender({
            element: newElements[0],
            scopedNodeData: domy.scopedNodeData
          });

          // Wait for clonage and component replacement

          for (const element of newElements) {
            renderedChildrensForCurrentRender.add(element);
            renderedChildrens.set(element, unmount);
          }
        } else {
          renderedChildrensForCurrentRender.add(element);
        }
      }

      ++valueIndex;
    };

    if (isForIn) {
      // Handle "for in"
      for (const value in executedValue) renderChilds(value);
    } else {
      // Handle "for of"
      for (const value of executedValue) renderChilds(value);
    }

    // Remove remaining childs that shouldn't be there
    for (const child of el.childNodes) {
      if (!renderedChildrensForCurrentRender.has(child)) {
        child.remove();

        const unmount = renderedChildrens.get(child);
        if (unmount) {
          unmount();
          renderedChildrens.delete(child);
        }
      }
    }
  });

  domy.cleanup(() => {
    for (const [element, unmount] of renderedChildrens.entries()) {
      unmount();
      renderedChildrens.delete(element);
    }
  });

  return { skipChildsRendering: true };
}
