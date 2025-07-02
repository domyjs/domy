import type { DomyDirectiveHelper, DomyDirectiveReturn, DomyPluginDefinition } from '@domyjs/domy';

const WILDCARDS = {
  '9': /\d/,
  a: /[a-zA-Z]/,
  '*': /./
};

/**
 * Apply a specified mask on a string
 * @param value
 * @param mask
 * @returns
 *
 * @author yoannchb-pro
 */
function applyMask(value: string, mask: string): string {
  let masked = '';
  let valueIndex = 0;

  for (let i = 0; i < mask.length; i++) {
    const m = mask[i] as keyof typeof WILDCARDS;
    const v = value[valueIndex];

    if (!v) break;

    if (WILDCARDS[m]) {
      if (WILDCARDS[m].test(v)) {
        masked += v;
        valueIndex++;
      } else {
        valueIndex++; // Skip non-matching value
        i--; // Try same mask again
      }
    } else {
      masked += m;
      if (v === m) valueIndex++;
    }
  }

  return masked;
}

/**
 * Provide a helper for money mask
 * @param input
 * @param decimal
 * @param thousands
 * @param precision
 * @returns
 *
 * @author yoannchb-pro
 */
function moneyHelper() {
  return function (
    input: string,
    delimiter: string = '.',
    thousands?: string,
    precision: number = 2
  ): string {
    if (input === '-') return '-';
    if (/^\D+$/.test(input)) return '9';

    if (thousands == null) {
      thousands = delimiter === ',' ? '.' : ',';
    }

    const addThousands = (value: string, sep: string): string => {
      let output = '';
      let counter = 0;
      for (let i = value.length - 1; i >= 0; i--) {
        if (value[i] === sep) continue;
        if (counter === 3) {
          output = value[i] + sep + output;
          counter = 0;
        } else {
          output = value[i] + output;
        }
        counter++;
      }
      return output;
    };

    const minus = input.startsWith('-') ? '-' : '';
    const stripped = input.replace(new RegExp(`[^0-9\\${delimiter}]`, 'g'), '');
    const [intPart] = stripped.split(delimiter);

    let mask = minus + addThousands('9'.repeat(intPart.length), thousands);
    if (precision > 0 && input.includes(delimiter)) {
      mask += delimiter + '9'.repeat(precision);
    }

    return mask;
  };
}

/**
 * Move the cursor to the correct position
 * @param el
 *
 * @author yoannchb-pro
 */
function setCursorPreserving(
  el: HTMLInputElement,
  oldValue: string,
  newValue: string,
  oldCursor: number
) {
  const lengthDiff = newValue.length - oldValue.length;
  const nextCursor = oldCursor + lengthDiff;
  el.setSelectionRange(nextCursor, nextCursor);
}

/**
 * Handle static mask
 * @param domy
 * @returns
 *
 * @author yoannchb-pro
 */
function staticMaskDirective(domy: DomyDirectiveHelper): DomyDirectiveReturn {
  const maskPattern = domy.attr.value;
  if (!maskPattern) return;

  const el = domy.block.getEl() as HTMLInputElement;

  const inputHandler = () => {
    const oldValue = el.value;
    const oldCursor = el.selectionStart ?? oldValue.length;

    const masked = applyMask(oldValue, maskPattern);

    if (masked !== oldValue) {
      el.value = masked;
      setCursorPreserving(el, oldValue, masked, oldCursor);
    }
  };

  const blurHandler = () => {
    el.value = applyMask(el.value, maskPattern);
  };

  el.addEventListener('input', inputHandler);
  el.addEventListener('blur', blurHandler);

  domy.cleanup(() => {
    el.removeEventListener('input', inputHandler);
    el.removeEventListener('blur', blurHandler);
  });
}

/**
 * Handle dynamic mask
 * @param domy
 *
 * @author yoannchb-pro
 */
function dynamicMaskDirective(domy: DomyDirectiveHelper): DomyDirectiveReturn {
  const getMask = domy.evaluate(domy.attr.value);
  const el = domy.block.getEl() as HTMLInputElement;

  const resolveMask = (input: string): string | null => {
    if (typeof getMask === 'function') return getMask(input);
    return getMask;
  };

  const inputHandler = () => {
    const oldValue = el.value;
    const oldCursor = el.selectionStart ?? oldValue.length;

    const mask = resolveMask(oldValue);
    if (!mask || typeof mask !== 'string') return;

    const masked = applyMask(oldValue, mask);

    if (masked !== oldValue) {
      el.value = masked;
      setCursorPreserving(el, oldValue, masked, oldCursor);
    }
  };

  const blurHandler = () => {
    const value = el.value;
    const mask = resolveMask(value);

    if (mask && typeof mask === 'string') {
      el.value = applyMask(value, mask);
    }
  };

  el.addEventListener('input', inputHandler);
  el.addEventListener('blur', blurHandler);

  domy.cleanup(() => {
    el.removeEventListener('input', inputHandler);
    el.removeEventListener('blur', blurHandler);
  });
}

/**
 * Redirect the directive to static mode or dynamic mode
 * @param domy
 * @returns
 *
 * @author yoannchb-pro
 */
function maskDirective(domy: DomyDirectiveHelper): DomyDirectiveReturn {
  if (domy.modifiers.includes('dynamic')) return dynamicMaskDirective(domy);
  return staticMaskDirective(domy);
}

/**
 * Mask Plugin
 * @param domyPluginSetter
 *
 * @author yoannchb-pro
 */
function maskPlugin(domyPluginSetter: DomyPluginDefinition): DomyDirectiveReturn {
  domyPluginSetter.helper('money', moneyHelper);
  domyPluginSetter.directive('mask', maskDirective);
  domyPluginSetter.directive('mask:dynamic', maskDirective);
}

export default maskPlugin;
