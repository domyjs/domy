import { Block } from '../core/Block';
import { DomyDirectiveHelper, DomyDirectiveReturn } from '../types/Domy';

/**
 * d-insert implementation
 * Allow to replace the current element by an other element and to render it with a modifier
 * Example:
 * <div
 *   d-scope="{ count: 0, createP: () => {
 *     const p = document.createElement('p');
 *     p.textContent = 'Count: {{ count }}';
 *     return p;
 *   } }"
 * >
 *  <template d-insert.render="createP()"></template>
 * </di>
 * @param domy
 *
 * @author yoannchb-pro
 */
export function dInsertImplementation(domy: DomyDirectiveHelper): DomyDirectiveReturn {
  if (!domy.block.isTemplate())
    throw new Error(`The directive "${domy.directive}" sould only be use on template element.`);

  let isInit = false;
  const shouldBeRender = domy.modifiers.includes('render');
  const originalEl = domy.block.getEl();

  const tracePositionComment = new Comment('d-insert position tracking, do not remove');
  originalEl.before(tracePositionComment);
  originalEl.remove();

  const lastRenders: Block[] = [];

  domy.cleanup(() => {
    tracePositionComment.remove();
  });

  domy.effect(() => {
    const elementToRender: Element | null | undefined = domy.evaluate(domy.attr.value.trim());

    if (Array.isArray(elementToRender))
      throw new Error(`The directive "${domy.directive}" only support one element as parameter.`);

    // Handle remove transition and unmount the last render
    if (lastRenders.length > 0) {
      // Ensure we have a max of two elements (the one entering and the one leaving) as same time
      while (lastRenders.length > 1) lastRenders[0].cleanTransition();

      // We unmount the current lastRender not the current block otherwise this effect will be unmount too
      const lastRender = lastRenders[lastRenders.length - 1];
      lastRender.transition = domy.block.transition;
      lastRender.applyTransition('outTransition', () => {
        lastRender.getEl().remove();
        const index = lastRenders.indexOf(lastRender);
        if (index !== -1) lastRenders.splice(index, 1);
      });
      lastRender.unmount();
    }

    // Handle the case we don't have any element to render
    if (!elementToRender) return;

    // We restore the element to his original position
    tracePositionComment.after(elementToRender);

    // Render the element
    if (shouldBeRender) {
      const newRender = domy.deepRender({
        element: elementToRender,
        scopedNodeData: domy.scopedNodeData
      });

      lastRenders.push(newRender);
      domy.block.setEl(newRender);
    } else {
      domy.block.setEl(elementToRender);
      const newBlock = domy.block.createNewElementBlock(); // avoid unmounting the template
      lastRenders.push(newBlock);
    }

    // Handle enter transition
    if (isInit || domy.block.transition?.init) {
      const lastRender = lastRenders[lastRenders.length - 1];
      lastRender.transition = domy.block.transition;
      lastRender.applyTransition('enterTransition');
    }

    isInit = true;
  });

  return {
    skipChildsRendering: true,
    skipComponentRendering: true,
    skipOtherAttributesRendering: true
  };
}
