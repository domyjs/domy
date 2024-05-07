import { createApp } from './core/createApp';
import { registerPlugin } from './core/registerPlugin';

const DOMY = {
  configure(config: { csp: boolean }) {
    if (config.csp) {
      // TODO: Domy.setEvaluator((path) => get(app.state.data.reactiveObj, path))
    }
  },
  createApp,
  plugin: registerPlugin
} as const;

export default DOMY;
