import { createApp } from './core/createApp';

const DOMY = {
  configure(config: { csp: boolean }) {
    if (config.csp) {
      // TODO: Domy.setEvaluator((path) => get(app.state.data.reactiveObj, path))
    }
  },
  createApp,
  registerPlugin: () => null // TODO
} as const;

export default DOMY;
