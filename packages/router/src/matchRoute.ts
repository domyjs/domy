/**
 * Matches a given route pattern against a path and extracts any named parameters.
 * Supports standard, optional, rest, and extension-based parameters using a custom mini-syntax.
 *
 * Supported route patterns:
 * - `:param`         → required parameter (e.g., `/user/:id` matches `/user/123`)
 * - `:param?`        → optional parameter (e.g., `/user/:id?` matches `/user` or `/user/123`)
 * - `:param+`        → one or more segments (e.g., `/path/:file+` matches `/path/a/b/c`)
 * - `:param*`        → zero or more segments (e.g., `/docs/:section*` matches `/docs` or `/docs/a/b`)
 * - `:param(regex)` → custom regex for the parameter (e.g., `/item/:id(\\d+)` matches only digits like `/item/42`)
 *
 * Examples:
 * matchRoute('/user/:id(\\d+)', '/user/42') → { isMatching: true, params: { id: '42' } }
 * matchRoute('/docs/:path*', '/docs/a/b') → { isMatching: true, params: { path: 'a/b' } }
 * matchRoute()
 *
 * @param route The route pattern to match (e.g., "/user/:id?")
 * @param path The actual path to test (e.g., "/user/123")
 * @returns An object with `isMatching` (boolean) and `params` (Record<string, string>) if matched
 *
 * @author yoannchb-pro
 */
export function matchRoute(route: string, path: string) {
  const result = { isMatching: false, params: {} as Record<string, string> };

  path = path.replace(/\/+$/, '') || '/';
  let pattern = route.replace(/\/+$/, '') || '/';

  pattern = pattern.replace(
    /:([a-zA-Z0-9_]+)(\(.+?\))?([?*+])?(?:\/|$)/g,
    function (_, paramName, regex, wildCard) {
      const matchingRegex = regex ?? '[^/]+';
      switch (wildCard) {
        case '?':
          return String.raw`(?:(?<${paramName}>(${matchingRegex})))?`;
        case '*':
          return String.raw`(?:(?<${paramName}>(${matchingRegex}(?:\/${matchingRegex})*)))?`;
        case '+':
          return String.raw`(?<${paramName}>(${matchingRegex}(?:\/${matchingRegex})*))`;
        default:
          return String.raw`(?<${paramName}>${matchingRegex})`;
      }
    }
  );

  const regex = new RegExp(`^${pattern}$`, 'i');
  const match = path.match(regex);

  if (!match) return result;

  result.isMatching = true;
  if (match.groups) result.params = match.groups;

  return result;
}
