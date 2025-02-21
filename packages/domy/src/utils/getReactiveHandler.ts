/**
 * Allow to handle signal without using "signal.value" in the dom
 * @param obj
 * @param key
 * @returns
 *
 * @author yoannchb-pro
 */
export function getSignalHandler(obj: Record<string, any>, key: string): PropertyDescriptor {
  return {
    enumerable: true,
    configurable: true,
    get() {
      return obj[key].value;
    },
    set(newValue: any) {
      return (obj[key].value = newValue);
    }
  };
}
