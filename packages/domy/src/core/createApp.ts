import { StructuredAPIApp } from '../types/App';
import { Config } from '../types/Config';
import { hookAPI, HookAPIFnDefinition } from './hookAPI';
import { structuredAPI } from './structuredAPI';

/**
 * Initialise domy on a target (by default the body)
 * @param appDefinition
 * @param target
 *
 * @author yoannchb-pro
 */
export function createApp(appDefinition: StructuredAPIApp | HookAPIFnDefinition) {
  let config: Config = {};

  function mount(target?: HTMLElement) {
    const build = () => {
      const domTarget = target ?? document.body;
      if (typeof appDefinition === 'function') return hookAPI(appDefinition, domTarget, config);
      return structuredAPI(appDefinition, domTarget, config);
    };

    // We ensure the DOM is accessible before mounting the app
    if (document.readyState === 'interactive' || document.readyState === 'complete') {
      build();
    } else document.addEventListener('DOMContentLoaded', build);
  }

  function configure(newConfig: Config) {
    config = newConfig;
    return { mount };
  }

  return {
    mount,
    configure
  };
}
