/**
 * Warn log function for domy
 * @param msg
 *
 * @author yoannchb-pro
 */
export function warn(msg: string) {
  console.warn('(Domy Warning)', msg);
}

/**
 * Error log function for domy
 * @param err
 *
 * @author yoannchb-pro
 */
export function error(err: Error) {
  console.error('(Domy Error)', err);
}
