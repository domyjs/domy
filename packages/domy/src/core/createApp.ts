import { OptionApiApp } from '../types/App';
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
  function mount(target?: HTMLElement) {
    const domTarget = target ?? document.body;
    if (typeof app === 'function') return compositionAPI(app, domTarget);
    return optionAPI(app, domTarget);
  }

  function config() {
    return { mount };
  }

  return {
    mount,
    config
  };
}
