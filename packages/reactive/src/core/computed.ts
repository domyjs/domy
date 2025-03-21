const isComputedSymbol = Symbol();

/**
 * Will return a boolean determining if an object is a computed value or not
 * @param obj
 * @returns
 *
 * @author yoannchb-pro
 */
export function isComputed(obj: any) {
  return !!obj?.[isComputedSymbol];
}

/**
 * Create a computed variable based on a signal
 * Example:
 * const count = signal(1);
 * const doubleCount = computed(() => count.value * 2);
 * console.log(doubleCount); // 2
 * @param getter
 * @param setter
 * @returns
 *
 * @author yoannchb-pro
 */
export function computed<T extends () => unknown, R extends ReturnType<T>>(
  getter: () => R,
  setter?: (newValue: R) => void
) {
  return {
    [isComputedSymbol]: true,
    get value(): R {
      return getter();
    },
    set value(newValue: R) {
      if (setter) setter(newValue);
      else
        throw new Error(
          'You are trying to modify the "value" property of a computed, but this computed have no setter setuped.'
        );
    }
  };
}
