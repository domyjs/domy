import { configuration } from '../config';
import { Config } from '../types/Config';
import { get } from '../utils/getAndSet';
import { DomyHelper } from './DomyHelper';

/**
 * Allow the user to configure DOMY
 * @param config
 */
export function configure(config: Config) {
  // Handle CSP: Content Security Policy
  if (config.csp) {
    DomyHelper.setEvaluator(evaluatorConf => {
      const path = evaluatorConf.contextAsGlobal
        ? evaluatorConf.code.replace(/^this\./g, '')
        : evaluatorConf.code;
      const value = get(evaluatorConf.context, path);
      if (evaluatorConf.returnResult) return value;
    });
  }

  configuration.setConfig(config);
}
