function splitPath(path: string): string[] {
  return path.replace(/\[(\w+)\]/g, '.$1').split('.');
}

/**
 * Get function (like get in lodash)
 * @param object
 * @param path
 * @param defaultValue
 * @returns
 *
 * @author yoannchb-pro
 */
export function get<T extends Object>(object: T, path: string, defaultValue?: any) {
  const keys = splitPath(path);
  let result: any = object;
  for (const key of keys) {
    result = result?.[key];
    if (result === undefined) {
      return defaultValue;
    }
  }
  return result;
}

/**
 * Set function (like set in lodash)
 * @param object
 * @param path
 * @param value
 * @returns
 *
 * @author yoannchb-pro
 */
export function set<T extends Object>(object: T, path: string, value: any): T {
  const keys = splitPath(path);
  let temp: any = object;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!temp[key] || typeof temp[key] !== 'object') {
      temp[key] = /^\d+$/.test(keys[i + 1]) ? [] : {};
    }
    temp = temp[key];
  }
  temp[keys[keys.length - 1]] = value;
  return object;
}
