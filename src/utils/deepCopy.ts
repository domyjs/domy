/**
 * Deep copy of an object
 * @param obj
 * @returns
 */
export function deepCopy(obj: any): any {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  let copy: any = Array.isArray(obj) ? [] : {};

  for (const key in obj) {
    copy[key] = deepCopy(obj[key]);
  }

  return copy;
}
