import { DomyDirectiveHelper } from '../types/Domy';

/**
 * Render a textContent
 * Example with count = 5:
 * Count: {{ count }}
 * Will give
 * Count: 5
 * @param domy
 *
 * @author yoannchb-pro
 */
export function renderText(domy: DomyDirectiveHelper) {
  const originalTextContent = domy.block.getEl().textContent ?? '';

  domy.effect(() => {
    domy.block.getEl().textContent = originalTextContent.replace(
      /\{\{\s*(?<org>.+?)\s*\}\}/g,
      function (_, code) {
        return domy.evaluate(code);
      }
    );
  });
}
