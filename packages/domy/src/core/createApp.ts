import { App } from '../types/App';
import { State } from '../types/State';
import { getContext } from '../utils/getContext';
import { error } from '../utils/logs';
import { toRegularFn } from '../utils/toRegularFn';
import { deepRender } from './deepRender';
import { reactive } from './reactive';

/**
 * Initialise domy state on a target (by default the body)
 * @param app
 * @param target
 *
 * @author yoannchb-pro
 */
export async function createApp(app: App = {}, target?: Element) {
  // State of the app
  const state: State = {
    data: reactive(app.data ?? {}),
    methods: {},
    events: {},
    refs: {},
    transitions: new Map()
  };

  // Functions
  for (const key in app.methods) {
    const method = toRegularFn(app.methods[key]);
    state.methods[key] = function (...args: any[]) {
      // TODO: Fixe get call
      const res = method.call(getContext(undefined, state), ...args);
      return res;
    };
  }

  // Watchers
  for (const watcherName in app.watch) {
    const watcherfn = toRegularFn(app.watch[watcherName]);

    state.data.attachListener({
      type: 'onSet',
      fn: async ({ path, prevValue, newValue }) => {
        const match = state.data.matchPath(watcherName, path);
        if (match.isMatching) {
          try {
            // TODO: Fix other dep called
            // Maybe something like prevent()
            await watcherfn.call(getContext(undefined, state), prevValue, newValue, {
              path,
              params: match.params
            });
          } catch (err: any) {
            error(err);
          }
        }
      }
    });
  }

  // Setup
  if (app.setup) {
    try {
      const setupFn = toRegularFn(app.setup);
      await setupFn.call(getContext(undefined, state));
    } catch (err: any) {
      error(err);
    }
  }

  // Init domy
  if (document.readyState === 'complete') {
    await mountApp();
  } else document.addEventListener('DOMContentLoaded', mountApp);

  async function mountApp() {
    deepRender({
      element: target ?? document.body,
      state
    });

    // Mounted
    if (app.mounted) {
      try {
        const mountedFn = toRegularFn(app.mounted);
        await mountedFn.call(getContext(undefined, state));
      } catch (err: any) {
        error(err);
      }
    }
  }
}
