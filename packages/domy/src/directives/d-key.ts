import { DomyDirectiveHelper, DomyDirectiveReturn } from '../types/Domy';

/**
 * d-key implementation
 * Allow to keep track of change into an array
 * It have to be combined with d-for
 * Example:
 * <ul d-for="element of array">
 *  <li d-key="element.id">...</li>
 * </ul>
 * @param domy
 *
 * @author yoannchb-pro
 */
export function dKeyImplementation(domy: DomyDirectiveHelper): DomyDirectiveReturn {
  let render: ReturnType<DomyDirectiveHelper['deepRender']> | null = null;
  let registeredKey: { key: string; getRenderedElement: () => Element } | null = null;

  domy.effect(() => {
    const key = domy.evaluate(domy.attr.value);

    if (!registeredKey) {
      // First render of the key
      render = domy.deepRender({
        element: domy.el,
        scopedNodeData: domy.scopedNodeData
      });
      registeredKey = {
        key,
        getRenderedElement: render.getRenderedElement
      };
      domy.state.keys.push(registeredKey);
    } else {
      // Updating the key
      registeredKey.key = key;
    }
  });

  domy.cleanup(() => {
    if (registeredKey && render) {
      const index = domy.state.keys.indexOf(registeredKey);
      domy.state.keys.splice(index, 1);

      render.unmount();
    }
  });

  return {
    skipChildsRendering: true,
    skipOtherAttributesRendering: true,
    skipComponentRendering: true
  };
}
