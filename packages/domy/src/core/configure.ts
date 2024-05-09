import { configuration } from '../config';
import { Config } from '../types/Config';
import { get } from '../utils/getAndSet';
import { DomyHelper } from './DomyHelper';

/**
 * Handle CSP: Content Security Policy
 *
 * @author yoannchb-pro
 */
function handleCSP() {
  DomyHelper.setEvaluator(evaluatorConf => {
    const pathFn = evaluatorConf.contextAsGlobal
      ? evaluatorConf.code.replace(/^this\./g, '')
      : evaluatorConf.code;
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
  if (config.CSP) {
    handleCSP();
  }

  configuration.setConfig(config);
}
