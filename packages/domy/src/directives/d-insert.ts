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

  const shouldBeRender = domy.modifiers.includes('render');
  const originalEl = domy.block.el;

  const tracePositionComment = new Comment('d-insert position tracking, do not remove');
  originalEl.before(tracePositionComment);
  originalEl.remove();

  let lastRender: Block | null = null;

  domy.cleanup(() => {
    tracePositionComment.remove();
  });

  domy.effect(() => {
    const elementToRender: Element | null | undefined = domy.evaluate(domy.attr.value.trim());

    if (Array.isArray(elementToRender))
      throw new Error(`The directive "${domy.directive}" only support one element as parameter.`);

    // Handle remove transition and unmount the last render
    if (lastRender) {
      // We unmount the current lastRender not the current block otherwise this effect will be unmount too
      lastRender.transition = domy.block.transition;
      lastRender.remove();
      lastRender.unmount();
    }

    // Handle the case we don't have any element to render
    if (!elementToRender) {
      return (lastRender = null);
    }

    // We restore the element to his original position
    tracePositionComment.before(elementToRender);

    // Render the element
    if (shouldBeRender) {
      lastRender = domy.deepRender({
        element: elementToRender,
        scopedNodeData: domy.scopedNodeData
      });

      domy.block.setEl(lastRender);
    } else {
      domy.block.setEl(elementToRender);
      lastRender = domy.block.createNewElementBlock(); // avoid unmounting the template
    }

    // Handle enter transition
    domy.block.applyTransition('enterTransition');
  });

  return {
    skipChildsRendering: true,
    skipComponentRendering: true,
    skipOtherAttributesRendering: true
  };
}
