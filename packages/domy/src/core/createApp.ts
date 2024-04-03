import { App } from '@domy/types';
import { State } from '@domy/types';
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
  const $state: State = {
    $state: [],
    $fn: {},
    $events: {},
    $refs: {}
  };

  // States
  for (const key in app.$state) {
    $state.$state.push(new Signal(key, app.$state[key]));
  }

  // Functions
  for (const key in app.$fn) {
    $state.$fn[key] = toRegularFn(app.$fn[key]);
  }

  // Watchers
  for (const watcherName in app.$watch) {
    const signal = $state.$state.find(s => s.name === watcherName);

    if (!signal) {
      console.error(`Invalide watcher name "${watcherName}"`);
      continue;
    }

    const watcherfn = toRegularFn(app.$watch[watcherName]);

    signal.attach({
      fn: async () => {
        // We remove the watcher too don't trigger it an other time if the user change the value
        const watcher = signal.dependencies[0] as Dependencie;
        watcher.unactive = true;
        try {
          await watcherfn.call(getContext(undefined, $state));
        } catch (err) {
          console.error(err);
        }
        watcher.unactive = false;
      }
    });
  }

  // Setup
  if (app.$setup) {
    try {
      const setupFn = toRegularFn(app.$setup);
      await setupFn.call(getContext(undefined, $state));
    } catch (err) {
      console.error(err);
    }
  }

  if (document.readyState === 'complete') {
    initDomy(app, targetElement, $state);
  } else document.addEventListener('DOMContentLoaded', () => initDomy(app, targetElement, $state));

  // We display a warn message if a key doesn't exist
  const properties = ['$state', '$fn', '$setup', '$mounted', '$watch'] as (keyof App)[];
  const unknowKeys = Object.keys(app).filter(key => !properties.includes(key as any));
  if (unknowKeys.length > 0) console.warn(`Unknown properties "${unknowKeys.join(', ')}"`);
}
