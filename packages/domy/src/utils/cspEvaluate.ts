import { EvaluateProps } from './evaluate';
import { get } from './getAndSet';

/**
 * An evalutor function like evaluate but which support CSP
 * @param evaluatorConf
 * @returns
 *
 * @author yoannchb-pro
 */
export function cspEvaluate(evaluatorConf: EvaluateProps) {
  const pathFn = evaluatorConf.contextAsGlobal
    ? evaluatorConf.code
    : evaluatorConf.code.replace(/^this\./g, '');
  const isFn = pathFn.endsWith('()');
  const path = pathFn.replace(/\(\)$/g, '');

  let value = get(evaluatorConf.context, path);

  if (isFn) value = value();
  if (evaluatorConf.returnResult) return value;
}
