/**
 * Debounce utility implementation
 * @param domy
 * @returns
 *
 * @author yoannchb-pro
 */
export function $debounce() {
  return function (fn: Function, delay: number) {
    let timeoutId: NodeJS.Timeout;
    return function (this: any, ...args: any[]) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        fn.apply(this, args);
      }, delay);
    };
  };
}
