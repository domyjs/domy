import { App } from '../types/App';
import { State } from '../types/State';
import { getContext } from '../utils/getContext';
import { toRegularFn } from '../utils/toRegularFn';
import { render } from './render';

/**
 * Init domy when the dom and state are ready
 * @param app
 * @param target
 * @param $state
 */
export async function initDomy(app: App, target: Element, state: State) {
  // Rendering
  // TODO

  // Mounted
  if (app.mounted) {
    try {
      const mountedFn = toRegularFn(app.mounted);
      await mountedFn.call(getContext(undefined, state));
    } catch (err) {
      console.error(err);
    }
  }
}
