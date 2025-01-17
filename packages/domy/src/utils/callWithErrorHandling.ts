/**
 * Call a function with error handling
 * @param fn
 * @returns
 *
 * @author yoannchb-pro
 */
export function callWithErrorHandling<T extends (...args: any[]) => any>(
  fn: T,
  onError?: (err: any) => void
): { hasError: true; err: any } | { hasError: false; result: ReturnType<T> } {
  try {
    const result = fn();
    return { hasError: false, result };
  } catch (err: any) {
    if (onError) onError(err);
    return { hasError: true, err };
  }
}
