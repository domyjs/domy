import { App } from '../types/App';
import { State } from '../types/State';
import { getContext } from '../utils/getContext';
import { toRegularFn } from '../utils/toRegularFn';
import { Signal, Dependencie } from './Signal';
import { initDomy } from './initDomy';

/**
 * Initialise domy state on a target (by default the body)
 * @param app
 * @param target
 */
export async function createApp(app: App, target?: Element) {
  const targetElement = target ?? document.body;

  // State of the app
  const state: State = {
    data: [],
    methods: {},
    events: {},
    refs: {}
  };

  // States
  for (const key in app.data) {
    state.data.push(new Signal(key, app.data[key]));
  }

  // Functions
  for (const key in app.data) {
    state.methods[key] = toRegularFn(app.data[key]);
  }

  // Watchers
  for (const watcherName in app.watch) {
    const signal = state.data.find(s => s.name === watcherName);

    if (!signal) {
      console.error(`Invalide watcher name "${watcherName}"`);
      continue;
    }

    const watcherfn = toRegularFn(app.watch[watcherName]);

    signal.attach({
      fn: async () => {
        // We remove the watcher too don't trigger it an other time if the user change the value
        const watcher = signal.dependencies[0] as Dependencie;
        watcher.unactive = true;
        try {
          await watcherfn.call(getContext(undefined, state));
        } catch (err) {
          console.error(err);
        }
        watcher.unactive = false;
      }
    });
  }

  // Setup
  if (app.setup) {
    try {
      const setupFn = toRegularFn(app.setup);
      await setupFn.call(getContext(undefined, state));
    } catch (err) {
      console.error(err);
    }
  }

  if (document.readyState === 'complete') {
    initDomy(app, targetElement, state);
  } else document.addEventListener('DOMContentLoaded', () => initDomy(app, targetElement, state));
}
