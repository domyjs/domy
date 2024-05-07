import { configuration } from './config';
import { createApp } from './core/createApp';
import { DomyHelper } from './core/DomyHelper';
import { registerPlugin } from './core/registerPlugin';
import { Config } from './types/Config';
import { get } from './utils/getAndSet';

const DOMY = {
  configure(config: Config) {
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
  },
  createApp,
  plugin: registerPlugin
} as const;

export default DOMY;
