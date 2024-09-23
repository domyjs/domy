import { DomyDirectiveHelper, DomyDirectiveReturn } from '../types/Domy';

/**
 * d-teleport implementation
 * Teleport the template content to a specific location
 * Usefull for modal for example which need to be at top of the screen
 * @param domy
 *
 * @author yoannchb-pro
 */
export function dTeleportImplementation(domy: DomyDirectiveHelper): DomyDirectiveReturn {
  if (domy.el.tagName !== 'TEMPLATE')
    throw Error(`The directive "${domy.attr.name}" should only be use on template element.`);

  const el = domy.el as HTMLTemplateElement;
  const childs = Array.from(el.content.childNodes);
  const target = document.querySelector(domy.attr.value);

  if (!target) throw Error(`Teleport canceled: can't find target "${domy.attr.value}".`);

  const unmountFns: (() => void)[] = [];

  for (const child of childs) {
    target.appendChild(child);
    const { unmount } = domy.deepRender({
      element: child as Element,
      scopedNodeData: domy.scopedNodeData
    });
    unmountFns.push(unmount);
  }

  domy.cleanup(() => {
    for (const unmountFn of unmountFns) {
      unmountFn();
    }
  });

  domy.el.remove();
}
