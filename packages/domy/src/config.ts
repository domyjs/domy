import { Config } from './types/Config';

let config: Config = {};

export const configuration = {
  setConfig(newConfig: Config) {
    config = newConfig;
  },
  getConfig() {
    return config;
  }
};
