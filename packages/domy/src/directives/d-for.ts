import { Block } from '../core/Block';
import { DomyDirectiveHelper, DomyDirectiveReturn } from '../types/Domy';

type RendererProps = {
  value: any;
  valueIndex: number;

  forPattern: RegExpExecArray;
  initialChilds: Element[];
  lastRenders: Block[];
  domy: DomyDirectiveHelper;
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
  const el = domy.block.el;
  const currentChildrens = Array.from(el.children);
  const currentRenders: (Block | Element)[] = [];

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

  for (let childIndex = 0; childIndex < props.initialChilds.length; ++childIndex) {
    const initialChild = props.initialChilds[childIndex] as Element;
    const currentIndex = props.valueIndex * props.initialChilds.length + childIndex;

    const keyAttr = initialChild.getAttribute('d-key');

    if (keyAttr) {
      // Check if the key already exist so we can skip render
      domy.addScopeToNode(scope);
      const currentKeyValue = domy.evaluate(keyAttr);
      domy.removeScopeToNode(scope);

      const oldRenderBlock = props.lastRenders.find(block => block.key === currentKeyValue);

      if (oldRenderBlock) {
        const oldRender = oldRenderBlock.el;
        const oldRenderIndex = currentChildrens.findIndex(
          currentChild => currentChild === oldRender
        );

        // If the index of the element changed we move it to the new position
        if (oldRenderIndex !== currentIndex) {
          domy.utils.moveElement(el, oldRender, currentIndex);
        }

        currentRenders.push(oldRender);
        continue;
      }
    }

    // Create and render the new element
    const newChild = initialChild.cloneNode(true) as Element;
    el.appendChild(newChild);
    const render = domy.deepRender({
      element: newChild,
      scopedNodeData: [...domy.scopedNodeData, scope]
    });
    currentRenders.push(render);
  }

  return currentRenders;
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
  const el = domy.block.el;
  const initialChilds = Array.from(el.children);
  const lastRenders: Block[] = [];

  // Display a warning message if the childrens don't have a d-key attribute
  for (const child of initialChilds) {
    if (!child.getAttribute('d-key')) {
      domy.utils.warn(
        `Elements inside the "${domy.directive}" directive should be rendered with "key" directive.`
      );
      break;
    }
  }

  // Checking "for" pattern
  const forRegex = /(?<dest>\w+)(?:,\s*(?<index>\w+))?\s+(?<type>in|of)\s+(?<org>.+)/gi;
  const forPattern = forRegex.exec(domy.attr.value);

  if (!forPattern)
    throw new Error(`Invalide "${domy.attr.name}" attribute value: "${domy.attr.value}".`);

  const isForIn = forPattern.groups!.type === 'in';

  // Remove the original content
  el.innerHTML = '';

  const handleChilds = () => {
    const el = domy.block.el;

    const executedValue = domy.evaluate(forPattern.groups!.org);

    let valueIndex = 0;

    const renderedChildrensForCurrentRender = new Set<Element | ChildNode | Node>();
    const renderChilds = (value: any) => {
      const renderedChildForCurrentValue = renderer({
        domy,
        forPattern,
        initialChilds,
        lastRenders,
        value,
        valueIndex
      });

      for (const render of renderedChildForCurrentValue) {
        if (render instanceof Block) {
          lastRenders.push(render);
          renderedChildrensForCurrentRender.add(render.el);
        } else {
          renderedChildrensForCurrentRender.add(render);
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
    const currChildrens = Array.from(el.children);
    for (const child of currChildrens) {
      if (!renderedChildrensForCurrentRender.has(child)) {
        child.remove();

        const renderIndex = lastRenders.findIndex(block => block.el === child);

        if (renderIndex !== -1) {
          const render = lastRenders[renderIndex];
          render.unmount();
          lastRenders.splice(renderIndex, 1);
        }
      }
    }
  };

  domy.effect(handleChilds);

  domy.cleanup(() => {
    for (const block of lastRenders) {
      block.unmount();
    }
  });

  return { skipChildsRendering: true };
}
