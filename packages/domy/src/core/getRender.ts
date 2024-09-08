import type { createDeepRenderFn } from './deepRender';

/**
 * Get the render function after mounting a DOMY app
 * It allow the user to append html element
 * Example:
 * const p = document.createElement('p');
 * p.textContent = 'Count: {{ count }}';
 * app.render(p);
 * container.appendChild(p);
 * @param deepRender
 * @param state
 * @returns
 *
 * @author yoannchb-pro
 */
export function getRender(deepRender: ReturnType<typeof createDeepRenderFn>) {
  return {
    render: (element: Element) => {
      return deepRender({
        element,
        scopedNodeData: []
      });
    }
  };
}
