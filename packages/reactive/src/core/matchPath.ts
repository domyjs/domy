type MatchingResult = { isMatching: boolean; params: Record<string, string> };

/**
 * Check if a path match a certain rule
 * Example:
 * path: todos.0.isComplete
 * reg: todos.*.isComplete or todos, todos.* or todos.*.*
 * Will give true
 * reg: todos.1.isComplete, todos.*.name, todos.*.*.id
 * Will give false
 * @param reg
 * @param path
 * @returns
 *
 * @author yoannchb-pro
 */
export function matchPath(reg: string, path: string): MatchingResult {
  const defaultRes: MatchingResult = {
    isMatching: false,
    params: {}
  };

  const rules = reg.split('.');
  const paths = path.split('.');

  const params: Record<string, string> = {};

  for (let i = 0; i < rules.length; ++i) {
    if (!path[i]) return defaultRes;

    const isParam = rules[i].match(/\{\w+\}/);
    if (rules[i] === '*' || isParam) {
      if (isParam) {
        const paramName = isParam[0];
        params[paramName.substring(1, paramName.length - 1)] = paths[i];
      }
      continue;
    }

    if (paths[i] !== rules[i]) return defaultRes;
  }

  return { isMatching: true, params };
}
