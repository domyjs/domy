import { Block } from '../core/Block';
import { DomyDirectiveHelper, DomyDirectiveReturn } from '../types/Domy';

type LastRender = { render: Block; reactiveIndex: { value: number }; loopId: number };

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
  let oldArrayLength = 0;

  const originalEl = domy.block.el;
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

  domy.effect(() => {
    currentLoopId += 1;

    const executedValue = domy.evaluate(forPattern.groups!.org);
    const executedValueObjs = isForIn ? Object.keys(executedValue) : executedValue;

    oldArrayLength = executedValueObjs.length;

    // Create or swap the elements
    const currentElements: { element: Element; index: number }[] = [];
    const renderFns: (() => void)[] = [];
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

      if (rawKey) {
        // Check if the key already exist so we can skip render
        const currentKeyValue = domy.evaluate(rawKey, scope);
        const oldRender = lastRenders.find(l => l.render.key === currentKeyValue);

        if (oldRender) {
          const oldRenderEl = oldRender.render.el;
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
      });
    }

    // Remove unecessary elements
    for (let i = lastRenders.length - 1; i >= 0; --i) {
      const render = lastRenders[i];
      if (render.loopId !== currentLoopId) {
        lastRenders.splice(i, 1);
        cleanupLastRender(render);
      }
    }

    // Move elements to the correct index
    for (const { element, index } of currentElements) {
      moveToIndexBetweenComments(
        element,
        index,
        traceStartPositionComment,
        traceEndPositionComment
      );
    }

    // Render new elements
    for (const renderFn of renderFns) {
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
