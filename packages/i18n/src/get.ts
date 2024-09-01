/**
 * Like the get method in lodash
 * @param obj
 * @param path
 * @returns
 *
 * @author yoannchb-pro
 */
export const get = <T extends Record<string, any>>(obj: T, path: string) => {
  const keys = path.split('.');
  let currentObj = obj;
  for (const key of keys) {
    currentObj = currentObj[key];
    if (!currentObj) return false;
  }
  return currentObj;
};
