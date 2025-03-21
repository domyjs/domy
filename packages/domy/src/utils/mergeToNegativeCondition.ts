/**
 * Allow us to merge conditions for d-else and d-else-if
 * @param conditions
 * @returns
 *
 * @author yoannchb-pro
 */
export function mergeToNegativeCondition(conditions: string[]) {
  return conditions.map(condition => `!(${condition})`).join(' && ');
}
