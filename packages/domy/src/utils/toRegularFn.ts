import { callWithErrorHandling } from './callWithErrorHandling';
import { warn } from './logs';

const AsyncFunction = async function () {}.constructor;

/**
 * Transform an arrow function to a regular function to bind the context
 * By doing this we loose global variables
 * @param arrowFn
 * @returns
 *
 * @author yoannchb-pro
 */
export function toRegularFn<T extends (...args: any[]) => any>(arrowFn: T): T {
  const errorHandler = callWithErrorHandling(() => {
    const fnString = arrowFn.toString();
    const match =
      /^(?<isAsync>async)?\s*\((?<params>[^)]*?)\)\s*=>\s*\{?(?<code>[\s\S]*?)\}?$/.exec(fnString);
    if (match) {
      const isAsync = match.groups?.isAsync === 'async';
      const fn = isAsync ? AsyncFunction : Function;
      const params = match.groups?.params.split(',') ?? [];
      const code = match.groups!.code;
      warn(
        `Deprecated use of arrow function (use regular function instead). The arrow function has been transform into a regular function but will loose external data.`
      );
      return fn(...params, isAsync ? `return (async () => { ${code} })()` : code) as T;
    }

    return arrowFn;
  });

  return errorHandler.hasError ? arrowFn : errorHandler.result;
}
