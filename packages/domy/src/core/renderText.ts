import { DomyDirectiveHelper } from '../types/Domy';

const reg = /\{\{\s*(?<org>.+?)\s*\}\}/gi;

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

  domy.effect(() => {
    if (reg.test(originalTextContent)) {
      domy.block.el.textContent = originalTextContent.replace(reg, function (_, code) {
        return domy.evaluate(code);
      });
    }
  });
}
