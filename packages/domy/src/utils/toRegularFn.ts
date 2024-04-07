const AsyncFunction = async function () {}.constructor;

/**
 * Transform an arrow function to a regular function to bind the context
 * @param arrowFn
 * @returns
 *
 * @author yoannchb-pro
 */
export function toRegularFn<T extends (...args: any[]) => any>(arrowFn: T): T {
  try {
    const fnString = arrowFn.toString();
    const match = /(?<isAsync>async)?\s*\((?<params>[^)]*?)\)\s*=>\s*\{?(?<code>[\s\S]*?)\}?$/.exec(
      fnString
    );
    if (match) {
      const isAsync = match.groups?.isAsync === 'async';
      const fn = isAsync ? AsyncFunction : Function;
      const params = match.groups?.params.split(',') ?? [];
      const code = match.groups!.code;
      return fn(...params, isAsync ? `return (async () => { ${code} })()` : code) as T;
    }
  } catch (err) {
    console.error(err);
  }

  return arrowFn;
}
