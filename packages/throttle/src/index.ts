/**
 * Throttle utility implementation
 * @param domy
 * @returns
 *
 * @author yoannchb-pro
 */
export function $throttle() {
  return function throttle(fn: Function, limit: number) {
    let inThrottle = false;
    return function (this: any, ...args: any[]) {
      if (!inThrottle) {
        fn.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  };
}
