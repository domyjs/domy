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
  const originalTextContent = domy.block.el.textContent ?? '';

  if (/\{\{\s*(?<org>.+?)\s*\}\}/g.test(originalTextContent)) {
    domy.effect(() => {
      domy.block.el.textContent = originalTextContent.replace(
        /\{\{\s*(?<org>.+?)\s*\}\}/g,
        function (_, code) {
          return domy.evaluate(code);
        }
      );
    });
  }
}
