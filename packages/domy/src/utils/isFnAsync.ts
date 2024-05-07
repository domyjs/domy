/**
 * Checks if a given function is an asynchronous function.
 * @param fn The function to check.
 * @returns True if the function is asynchronous, false otherwise.
 */
export function isFnAsync(fn: (...args: any) => any | Promise<any>): boolean {
  return fn.constructor.name === 'AsyncFunction';
}
