import { Block } from '../core/Block';
import { DomyDirectiveHelper, DomyDirectiveReturn } from '../types/Domy';

type LastRender = { render: Block; reactiveIndex: { value: number }; loopId: number };

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

  function insertToIndex(element: Element, lookingIndex: number) {
    let sibling = traceStartPositionComment.nextSibling;
    let index = 0;

    while (sibling !== traceEndPositionComment && index < lookingIndex) {
      ++index;
      sibling = sibling!.nextSibling;
    }

    if (sibling) sibling.before(element);
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
  const keysMap = new Map<string, LastRender>();
  const fragment = new DocumentFragment();

  domy.effect(() => {
    const canUseFragment = oldArrayLength === 0;
    const executedValue = domy.evaluate(forPattern.groups!.org);
    const executedValueObjs = isForIn ? Object.keys(executedValue) : executedValue;

    oldArrayLength = executedValueObjs.length;

    // Create or swap the elements
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

      if (rawKey && !canUseFragment) {
        // Check if the key already exist so we can skip render
        const currentKeyValue = domy.evaluate(rawKey, scope);
        const oldRender = keysMap.get(currentKeyValue);

        if (oldRender) {
          const oldRenderEl = oldRender.render.el;
          const oldRenderIndex = oldRender.reactiveIndex.value;

          // If the index of the element changed we move it to the new position
          if (oldRenderIndex !== index) {
            insertToIndex(oldRenderEl, index);
            oldRender.reactiveIndex.value = index;
          }

          oldRender.loopId = currentLoopId;

          continue;
        }
      }

      // Create and render the new element
      const newEl = originalEl.cloneNode(true) as Element;
      if (canUseFragment) fragment.appendChild(newEl);
      else insertToIndex(newEl, index);
      const render = domy.deepRender({
        element: newEl,
        scopedNodeData: [...domy.scopedNodeData, scope]
      });
      const newRender: LastRender = {
        render,
        reactiveIndex,
        loopId: currentLoopId
      };
      if (newRender.render.key) keysMap.set(newRender.render.key, newRender);
      lastRenders.push(newRender);
    }

    // We add all the new elements
    if (canUseFragment) {
      traceEndPositionComment.before(fragment);
    }

    // Remove unecessary elements
    if (!canUseFragment) {
      for (const render of lastRenders) {
        if (render.loopId !== currentLoopId) cleanupLastRender(render);
      }
    }

    currentLoopId += 1;
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
