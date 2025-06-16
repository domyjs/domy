/**
 * Convert a string to kebab case
 * Example:
 * console.log(toKebabCase('HelloWorld'));        // hello-world
 * console.log(toKebabCase('myVariableName'));    // my-variable-name
 * console.log(toKebabCase('Hello World Today')); // hello-world-today
 * @param str
 * @returns
 *
 * @author yoannchb-pro
 */
export function toKebabCase(str: string) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2') // Inserts a dash between lowercase and uppercase letters
    .replace(/\s+/g, '-') // Replaces spaces with dashes
    .toLowerCase(); // Converts everything to lowercase
}
