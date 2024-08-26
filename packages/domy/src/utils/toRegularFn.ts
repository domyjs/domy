import { error } from './logs';

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
  try {
    const fnString = arrowFn.toString();
    const match =
      /^(?<isAsync>async)?\s*\((?<params>[^)]*?)\)\s*=>\s*\{?(?<code>[\s\S]*?)\}?$/.exec(fnString);
    if (match) {
      const isAsync = match.groups?.isAsync === 'async';
      const fn = isAsync ? AsyncFunction : Function;
      const params = match.groups?.params.split(',') ?? [];
      const code = match.groups!.code;
      return fn(...params, isAsync ? `return (async () => { ${code} })()` : code) as T;
    }
  } catch (err: any) {
    error(err);
  }

  return arrowFn;
}
