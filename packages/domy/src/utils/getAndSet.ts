function splitPath(path: string): string[] {
  return path.replace(/\[(\w+)\]/g, '.$1').split('.');
}

export function get<T, R>(object: T, path: string, defaultValue?: R): R | undefined {
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

export function set<T>(object: T, path: string, value: any): T {
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
