import { OptionApiApp } from '../types/App';
import { Config } from '../types/Config';
import { compositionAPI, CompositionAPIFn } from './compositionAPI';
import { optionAPI } from './optionAPI';

/**
 * Initialise domy on a target (by default the body)
 * @param app
 * @param target
 *
 * @author yoannchb-pro
 */
export function createApp(app: OptionApiApp | CompositionAPIFn) {
  let config: Config = {};

  function mount(target?: HTMLElement) {
    const domTarget = target ?? document.body;
    if (typeof app === 'function') return compositionAPI(app, domTarget, config);
    return optionAPI(app, domTarget, config);
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
