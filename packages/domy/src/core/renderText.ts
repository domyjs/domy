import { DomyDirectiveHelper } from '@domyjs/types/src/Domy';

const reg = /\{\{\s*(?<org>.+?)\s*\}\}/gi;

/**
 * Render a textContent
 * Example with count = 5:
 * Count: {{ this.count.value }}
 * Will give
 * Count: 5
 * @param domy
 *
 * @author yoannchb-pro
 */
export function renderText(domy: DomyDirectiveHelper) {
  const originalTextContent = domy.el.textContent ?? '';

  domy.effect(() => {
    if (reg.test(originalTextContent)) {
      domy.el.textContent = originalTextContent.replace(reg, function (_, code) {
        return domy.evaluate(code);
      });
    }
  });
}
