/**
 * Check if a data is an Object
 * @param obj
 * @returns
 */
export function isObject(obj: any) {
  return typeof obj === 'object' && obj !== null && obj.constructor === Object;
}
