import { App, WatcherFn } from '../types/App';
import { DomyMountedEventDetails, DomyReadyEventDetails } from '../types/Events';
import { State } from '../types/State';
import { getContext } from '../utils/getContext';
import { error } from '../utils/logs';
import { toRegularFn } from '../utils/toRegularFn';
import { deepRender } from './deepRender';
import { globalWatch, matchPath, reactive } from './reactive';

const DOMY_EVENTS = {
  App: {
    Initialisation: 'domy:app:initialisation',
    Setuped: 'domy:app:setuped',
    Mounted: 'domy:app:mounted'
  }
};

/**
 * Initialise domy state on a target (by default the body)
 * @param app
 * @param target
 *
 * @author yoannchb-pro
 */
export async function createApp(app: App = {}) {
  const domTarget = app.target ?? document.body;

  // Initialisation event dispatch
  document.dispatchEvent(
    new CustomEvent(DOMY_EVENTS.App.Initialisation, {
      bubbles: true,
      detail: { app, target: domTarget } as DomyReadyEventDetails
    })
  );

  // State of the app
  const state: State = {
    data: reactive(app.data ?? {}),
    methods: {},
    events: {},
    refs: {},
    transitions: new Map()
  };

  // Methods
  for (const key in app.methods) {
    const method = toRegularFn(app.methods[key]);
    state.methods[key] = function (...args: any[]) {
      return method.call(getContext(undefined, state), ...args);
    };
  }

  // Watchers
  const watchers: Record<string, { locked: boolean; fn: WatcherFn }> = {};
  // We convert all watcher function to regular function so we can change the context
  for (const watcherName in app.watch) {
    watchers[watcherName] = { fn: toRegularFn(app.watch[watcherName]), locked: false };
  }
  // We attach a global watcher which will call the correct watcher
  globalWatch({
    type: 'onSet',
    fn: async ({ path, prevValue, newValue }) => {
      for (const watcherName in app.watch) {
        const isWatcherLocked = watchers[watcherName].locked; // We ensure the watcher can't call it self (act like a lock)

        const match = matchPath(watcherName, path);

        if (match.isMatching) {
          if (!isWatcherLocked) {
            watchers[watcherName].locked = true;

            try {
              const watcherfn = watchers[watcherName].fn;
              await watcherfn.call(getContext(undefined, state), prevValue, newValue, {
                path,
                params: match.params
              });
            } catch (err: any) {
              error(err);
            }
          }

          watchers[watcherName].locked = false;
        }
      }
    }
  });

  // Setup
  if (app.setup) {
    try {
      const setupFn = toRegularFn(app.setup);
      await setupFn.call(getContext(undefined, state));
    } catch (err: any) {
      error(err);
      return;
    }
  }

  // Setuped event dispatch
  document.dispatchEvent(
    new CustomEvent(DOMY_EVENTS.App.Setuped, {
      bubbles: true,
      detail: { app, target: domTarget } as DomyReadyEventDetails
    })
  );

  // Init domy
  if (document.readyState === 'complete') {
    await mountApp();
  } else document.addEventListener('DOMContentLoaded', mountApp);

  async function mountApp() {
    try {
      deepRender({
        element: domTarget,
        state
      });
    } catch (err: any) {
      error(err);
    }

    // Mounted
    if (app.mounted) {
      try {
        const mountedFn = toRegularFn(app.mounted);
        await mountedFn.call(getContext(undefined, state));
      } catch (err: any) {
        error(err);
      }
    }

    // Mounted event dispatch
    document.dispatchEvent(
      new CustomEvent(DOMY_EVENTS.App.Mounted, {
        bubbles: true,
        detail: { app, state, target: domTarget } as DomyMountedEventDetails
      })
    );
  }
}
