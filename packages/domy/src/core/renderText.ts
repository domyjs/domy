import { DomyPluginHelper } from '../types/Domy';

/**
 * Render a textContent
 * Example with count = 5:
 * Count: {{ this.count.value }}
 * Will give
 * Count: 5
 * @param domy
 * @author yoannchb-pro
 */
export function renderText(domy: DomyPluginHelper) {
  const originalTextContent = domy.el.textContent ?? '';

  domy.effect(() => {
    domy.el.textContent = originalTextContent.replace(
      /\{\{\s*(?<org>.+?)\s*\}\}/gi,
      function (_, code) {
        return domy.evaluate(code);
      }
    );
  });
}
