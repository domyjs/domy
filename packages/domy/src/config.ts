import { Config } from './types/Config';
import { error } from './utils/logs';

let config: Config = {};
let isConfigSet = false;

export const configuration = {
  setConfig(newConfig: Config) {
    // We check the app is not already configured
    if (isConfigSet) {
      error(new Error(`The configuration can only be set one time.`));
      return;
    }

    isConfigSet = true;
    config = newConfig;
  },
  getConfig() {
    return config;
  }
};
