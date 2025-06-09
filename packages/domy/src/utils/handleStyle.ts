import { toKebabCase } from './toKebabCase';

/**
 * Handle style attribute if it's an object
 * { backgroundColor: '#fff', color: 'red' .... }
 * @param executedValue
 * @param defaultStyle
 *
 * @author yoannchb-pro
 */
export function handleStyle(
  executedValue: any,
  defaultStyle: string = ''
): { style: string; cleanedStyle: (newDefaultStyle: string) => string } {
  const addedKeys = new Set<string>();
  const styleDict: Record<string, string> = {};

  // Parse defaultStyle
  for (const pair of defaultStyle
    .split(';')
    .map(s => s.trim())
    .filter(Boolean)) {
    const [key, value] = pair.split(':').map(s => s.trim());
    if (key && value) styleDict[key] = value;
  }

  // Parse executedValue
  if (typeof executedValue === 'string') {
    for (const pair of executedValue
      .split(';')
      .map(s => s.trim())
      .filter(Boolean)) {
      const [key, value] = pair.split(':').map(s => s.trim());
      if (key && value) {
        styleDict[key] = value;
        addedKeys.add(key);
      }
    }
  } else if (executedValue && typeof executedValue === 'object') {
    for (const key in executedValue) {
      const kebab = toKebabCase(key);
      styleDict[kebab] = executedValue[key];
      addedKeys.add(kebab);
    }
  }

  const style = Object.entries(styleDict)
    .map(([k, v]) => `${k}:${v}`)
    .join('; ');

  function cleanedStyle(newDefaultStyle: string): string {
    const newDict: Record<string, string> = {};
    for (const pair of newDefaultStyle
      .split(';')
      .map(s => s.trim())
      .filter(Boolean)) {
      const [key, value] = pair.split(':').map(s => s.trim());
      if (key && value && !addedKeys.has(key)) {
        newDict[key] = value;
      }
    }
    return Object.entries(newDict)
      .map(([k, v]) => `${k}:${v}`)
      .join('; ');
  }

  return { style, cleanedStyle };
}
