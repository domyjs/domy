import { Block } from '../core/Block';
import { DomyDirectiveHelper, DomyDirectiveReturn } from '../types/Domy';

type LastRender = {
  render: Block;
  reactiveIndex: { value: number };
  loopId: number;
  currentKey?: string;
};

function moveToIndexBetweenComments(
  element: Element,
  index: number,
  startComment: Comment,
  endComment: Comment
) {
  const nodesBetween: Element[] = [];
  let current = startComment.nextSibling;

  while (current && current !== endComment) {
    if (current.nodeType === Node.ELEMENT_NODE && current !== element) {
      nodesBetween.push(current as Element);
    }
    current = current.nextSibling;
  }

  const refNode = nodesBetween[index] || endComment;

  if (element.nextSibling === refNode) {
    return;
  }

  refNode.before(element);
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
  let currentLoopId = 0;

  const originalEl = domy.block.getEl();
  const rawKey = originalEl.getAttribute('d-key');

  const traceStartPositionComment = new Comment('d-for start position tracking, do not remove');
  const traceEndPositionComment = new Comment('d-for end position tracking, do not remove');
  originalEl.before(traceStartPositionComment);
  traceStartPositionComment.after(traceEndPositionComment);
  originalEl.remove();

  // Display a warning message if the childrens don't have a d-key attribute
  if (!rawKey) {
    domy.utils.warn(
      `Elements inside the "${domy.directive}" directive should be rendered with "key" directive.`
    );
  }

  function cleanupLastRender(lastRender: LastRender) {
    domy.unReactive(lastRender.reactiveIndex);
    lastRender.render.remove();
    lastRender.render.unmount();
  }

  // Checking "for" pattern
  const forRegex = /^(?<dest>\w+)(?:,\s*(?<index>\w+))?\s+(?<type>in|of)\s+(?<org>.+)$/i;
  const forPattern = forRegex.exec(domy.attr.value);

  if (!forPattern)
    throw new Error(`Invalide "${domy.attr.name}" attribute value: "${domy.attr.value}".`);

  const isForIn = forPattern.groups!.type === 'in';
  const lastRenders: LastRender[] = [];
  const keyedLastRenders = new Map<string, LastRender>();

  domy.effect(() => {
    currentLoopId += 1;

    const executedValue = domy.evaluate(forPattern.groups!.org);
    const executedValueObjs = isForIn ? Object.keys(executedValue) : executedValue;

    // Create or swap the elements
    const currentElements: { element: Element; index: number }[] = [];
    const renderFns: (() => LastRender)[] = [];
    let canUseTemplate = true;
    for (let index = 0; index < executedValueObjs.length; ++index) {
      const value = executedValueObjs[index];

      // Add the value to the scope
      let scope = {
        [forPattern!.groups!.dest]: value
      };
      // Add the index to the scope if needed
      const indexName = forPattern!.groups?.index;
      const reactiveIndex = indexName ? domy.signal(index) : { value: index };
      if (indexName) {
        scope = {
          ...scope,
          [indexName]: reactiveIndex
        };
      }

      let currentKeyValue: string | null = null;
      if (rawKey) {
        // Check if the key already exist so we can skip render
        currentKeyValue = domy.evaluate(rawKey, scope) as string;
        const oldRender = keyedLastRenders.get(currentKeyValue);

        if (oldRender) {
          canUseTemplate = false;

          const oldRenderEl = oldRender.render.getEl();
          const oldRenderIndex = oldRender.reactiveIndex.value;

          // Update the index if needed
          if (oldRenderIndex !== index) oldRender.reactiveIndex.value = index;

          currentElements.push({ element: oldRenderEl, index });
          oldRender.loopId = currentLoopId;

          continue;
        }
      }

      // Create and render the new element
      const newEl = originalEl.cloneNode(true) as Element;
      currentElements.push({ element: newEl, index });
      renderFns.push(() => {
        const render = domy.deepRender({
          element: newEl,
          scopedNodeData: [...domy.scopedNodeData, scope]
        });
        const newRender: LastRender = {
          render,
          reactiveIndex,
          loopId: currentLoopId
        };
        lastRenders.push(newRender);
        if (currentKeyValue) {
          newRender.currentKey = currentKeyValue;
          keyedLastRenders.set(currentKeyValue, newRender);
        }
        return newRender;
      });
    }

    // Remove unecessary elements
    for (let i = lastRenders.length - 1; i >= 0; --i) {
      const render = lastRenders[i];
      if (render.loopId !== currentLoopId) {
        if (render.currentKey) keyedLastRenders.delete(render.currentKey);
        lastRenders.splice(i, 1);
        cleanupLastRender(render);
      }
    }

    // Move elements to the correct index
    if (canUseTemplate) {
      const fragment = document.createDocumentFragment();
      for (const { element } of currentElements) {
        fragment.appendChild(element);
      }
      traceStartPositionComment.after(fragment);
    } else {
      for (const { element, index } of currentElements) {
        moveToIndexBetweenComments(
          element,
          index,
          traceStartPositionComment,
          traceEndPositionComment
        );
      }
    }

    // Render new elements from bottom to top
    for (let i = renderFns.length - 1; i >= 0; --i) {
      const renderFn = renderFns[i];
      renderFn();
    }
  });

  domy.cleanup(() => {
    traceStartPositionComment.remove();
    traceEndPositionComment.remove();
    for (const render of lastRenders) cleanupLastRender(render);
  });

  return {
    skipChildsRendering: true,
    skipComponentRendering: true,
    skipOtherAttributesRendering: true
  };
}
