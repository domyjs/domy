import { Block } from '../core/Block';
import { DomyDirectiveHelper, DomyDirectiveReturn } from '../types/Domy';

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
  const parent = originalEl.parentElement!;
  const originalBlock = domy.block;

  const tracePositionComment = new Comment('d-for position tracking, do not remove');
  originalEl.before(tracePositionComment);
  originalEl.remove();

  // Display a warning message if the childrens don't have a d-key attribute
  if (!originalEl.getAttribute('d-key')) {
    domy.utils.warn(
      `Elements inside the "${domy.directive}" directive should be rendered with "key" directive.`
    );
  }

  // Checking "for" pattern
  const forRegex = /(?<dest>\w+)(?:,\s*(?<index>\w+))?\s+(?<type>in|of)\s+(?<org>.+)/gi;
  const forPattern = forRegex.exec(domy.attr.value);

  if (!forPattern)
    throw new Error(`Invalide "${domy.attr.name}" attribute value: "${domy.attr.value}".`);

  const isForIn = forPattern.groups!.type === 'in';

  const lastRenders: { render: Block; reactiveIndex: { value: number } }[] = [];

  domy.effect(() => {
    const treatedRenders: { render: Block; reactiveIndex: { value: number } }[] = [];

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

      const keyAttr = originalEl.getAttribute('d-key');
      if (keyAttr) {
        // Check if the key already exist so we can skip render
        domy.addScopeToNode(scope);
        const currentKeyValue = domy.evaluate(keyAttr);
        domy.removeScopeToNode(scope);

        const oldRender = lastRenders.find(({ render }) => render.key === currentKeyValue);

        if (oldRender) {
          const oldRenderEl = oldRender.render.el;
          const oldRenderIndex = oldRender.reactiveIndex.value;

          // If the index of the element changed we move it to the new position
          if (oldRenderIndex !== index) {
            domy.utils.moveElement(parent, oldRenderEl, index);
            oldRender.reactiveIndex.value = index;
          }

          return treatedRenders.push(oldRender);
        }
      }

      // Create and render the new element
      const newEl = originalEl.cloneNode(true) as Element;
      tracePositionComment.before(newEl);
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
      if (treatedRenders.indexOf(render) === -1) {
        domy.unReactive(render.reactiveIndex);
        render.render.remove();
        render.render.unmount();
      }
    }
  });

  domy.cleanup(() => {
    tracePositionComment.remove();
    for (const render of lastRenders) {
      domy.unReactive(render.reactiveIndex);
      render.render.remove();
      render.render.unmount();
    }
  });

  return {
    skipChildsRendering: true,
    skipComponentRendering: true,
    skipOtherAttributesRendering: true
  };
}
