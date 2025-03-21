import { Block } from '../core/Block';
import { DomyDirectiveHelper, DomyDirectiveReturn } from '../types/Domy';

type LastRender = { render: Block; reactiveIndex: { value: number } };

/**
 * d-for implementation
 * Allow to render a list of element
 * It act like a for in javascript
 * @param domy
 *
 * @author yoannchb-pro
 */
export function dForImplementation(domy: DomyDirectiveHelper): DomyDirectiveReturn {
  const originalEl = domy.block.el;
  const rawKey = originalEl.getAttribute('d-key');

  const traceStartPositionComment = new Comment('d-for start position tracking, do not remove');
  const traceEndPositionComment = new Comment('d-for end position tracking, do not remove');
  originalEl.before(traceStartPositionComment);
  traceStartPositionComment.after(traceEndPositionComment);
  originalEl.remove();

  // Display a warning message if the childrens don't have a d-key attribute
  if (!originalEl.getAttribute('d-key')) {
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
  const forRegex = /(?<dest>\w+)(?:,\s*(?<index>\w+))?\s+(?<type>in|of)\s+(?<org>.+)/gi;
  const forPattern = forRegex.exec(domy.attr.value);

  if (!forPattern)
    throw new Error(`Invalide "${domy.attr.name}" attribute value: "${domy.attr.value}".`);

  const isForIn = forPattern.groups!.type === 'in';

  const lastRenders: LastRender[] = [];

  domy.effect(() => {
    const treatedRenders: LastRender[] = [];

    const renderEl = (value: unknown, index: number) => {
      // Add the value to the scope
      let scope = {
        [forPattern!.groups!.dest]: value
      };
      // Add the index to the scope if needed
      const reactiveIndex = domy.signal(index);
      if (forPattern!.groups?.index) {
        scope = {
          ...scope,
          [forPattern!.groups.index]: reactiveIndex
        };
      }

      if (rawKey) {
        // Check if the key already exist so we can skip render
        domy.addScopeToNode(scope);
        const currentKeyValue = domy.evaluate(rawKey);
        domy.removeScopeToNode(scope);

        const oldRender = lastRenders.find(({ render }) => render.key === currentKeyValue);

        if (oldRender) {
          const oldRenderEl = oldRender.render.el;
          const oldRenderIndex = oldRender.reactiveIndex.value;

          // If the index of the element changed we move it to the new position
          if (oldRenderIndex !== index) {
            insertToIndex(oldRenderEl, index);
            oldRender.reactiveIndex.value = index;
          }

          return treatedRenders.push(oldRender);
        }
      }

      // Create and render the new element
      const newEl = originalEl.cloneNode(true) as Element;
      insertToIndex(newEl, index);
      const render = domy.deepRender({
        element: newEl,
        scopedNodeData: [...domy.scopedNodeData, scope]
      });
      const newRender = { render, reactiveIndex };
      lastRenders.push(newRender);
      treatedRenders.push(newRender);
    };

    let index = 0;
    const executedValue = domy.evaluate(forPattern.groups!.org);

    // Create or swap the elements
    if (isForIn) {
      for (const value in executedValue) renderEl(value, index++);
    } else {
      for (const value of executedValue) renderEl(value, index++);
    }

    // Remove unecessary elements
    for (const render of lastRenders) {
      if (treatedRenders.indexOf(render) === -1) cleanupLastRender(render);
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
