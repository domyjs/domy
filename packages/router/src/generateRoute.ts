/**
 * Inject params / query params into a path
 * @param routePattern
 * @param params
 * @returns
 *
 * @author yoannchb-pro
 */
export function generateRoute(
  path: string,
  params: Record<string, string> = {},
  queryParams: Record<string, string> = {}
): string {
  const query = new URLSearchParams(queryParams).toString();
  return (
    path.replace(
      /:([a-zA-Z0-9_]+)(\([^)]+\))?([?*+])?(?:\/|$)/g,
      function (_, paramName: string, _regex: string, wildCard: string, offset: number, full) {
        const value = params[paramName];

        if (value !== undefined) return value + (full[offset + _.length - 1] === '/' ? '/' : '');

        // If param is optional (indicated by ? or *), remove it
        if (wildCard === '?' || wildCard === '*') return '';

        throw new Error(`(Router) Missing required parameter: ${paramName}.`);
      }
    ) + (query ? `?${query}` : '')
  );
}
