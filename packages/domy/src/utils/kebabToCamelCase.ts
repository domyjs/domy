/**
 * Convert a kebab string into a camelCase string
 * Example: show-error -> showError
 * @param str
 * @returns
 *
 * @author yoannchb-pro
 */
export function kebabToCamelCase(str: string): string {
  return str
    .toLowerCase()
    .split('-')
    .map((word, index) => (index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)))
    .join('');
}
