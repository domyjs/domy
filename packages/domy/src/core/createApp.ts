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
  if (typeof app === 'function') return compositionAPI(app);
  return optionAPI(app);
}
