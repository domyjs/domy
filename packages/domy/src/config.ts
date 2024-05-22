import { Config } from './types/Config';

let config: Config = {};
let isConfigSet = false;

export const configuration = {
  setConfig(newConfig: Config) {
    // We check the app is not already configured
    if (isConfigSet) throw new Error(`The configuration can only be set one time.`);

    isConfigSet = true;
    config = newConfig;
  },
  getConfig() {
    return config;
  }
};
