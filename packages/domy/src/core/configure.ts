import { configuration } from '../config';
import { Config } from '../types/Config';
import { get } from '../utils/getAndSet';
import { error } from '../utils/logs';
import { DomyHelper } from './DomyHelper';

/**
 * Handle CSP: Content Security Policy
 *
 * @author yoannchb-pro
 */
function handleCSP() {
  DomyHelper.setEvaluator(evaluatorConf => {
    const pathFn = evaluatorConf.contextAsGlobal
      ? evaluatorConf.code
      : evaluatorConf.code.replace(/^this\./g, '');
    const isFn = pathFn.endsWith('()');
    const path = pathFn.replace(/\(\)$/g, '');

    let value = get(evaluatorConf.context, path);

    if (isFn) value = value();
    if (evaluatorConf.returnResult) return value;
  });
}

/**
 * Allow the user to configure DOMY
 * @param config
 *
 * @author yoannchb-pro
 */
export function configure(config: Config) {
  try {
    configuration.setConfig(config);

    if (config.CSP) {
      handleCSP();
    }
  } catch (err: any) {
    error(err);
  }
}
