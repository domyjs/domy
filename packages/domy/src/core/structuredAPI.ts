import { StructuredAPIApp, WatcherFn } from '../types/App';
import { Config } from '../types/Config';
import { DomyMountedEventDetails, DomyReadyEventDetails } from '../types/Events';
import { State } from '../types/State';
import { getContext } from '../utils/getContext';
import { error } from '../utils/logs';
import { toRegularFn } from '../utils/toRegularFn';
import { DOMY_EVENTS } from './DomyEvents';
import { createDeepRenderFn } from './deepRender';
import { reactive, watch, matchPath } from '@domyjs/reactive';
import { getRender } from './getRender';
import { ComponentProps, Components } from '../types/Component';

type Params = {
  app?: StructuredAPIApp;
  target: HTMLElement;
  config: Config;
  components: Components;
  props?: ComponentProps;
  byPassAttributes?: string[]; // Some attribute have to be handled by an other DOMY instance in some components
};

/**
 * Structured API
 * Create a DOMY App with an object structure
 * @param app
 * @returns
 *
 * @author yoannchb-pro
 */
export async function structuredAPI(params: Params) {
  const { components, config, target, app = {}, props } = params;

  // Initialisation event dispatch
  document.dispatchEvent(
    new CustomEvent(DOMY_EVENTS.App.Initialisation, {
      bubbles: true,
      detail: { app, target } as DomyReadyEventDetails
    })
  );

  // State of the app
  const state: State = {
    data: reactive(app.data?.() ?? {}),
    props,
    methods: {},
    events: {},
    refs: {},
    transitions: new Map()
  };

  // Methods
  for (const key in app.methods) {
    const method = toRegularFn(app.methods[key]);
    state.methods[key] = function (...args: any[]) {
      return method.call(getContext({ state, scopedNodeData: [], config }), ...args);
    };
  }

  // Watchers
  const watchers: Record<string, { locked: boolean; fn: WatcherFn }> = {};
  // We convert all watcher function to regular function so we can change the context
  for (const watcherName in app.watch) {
    watchers[watcherName] = { fn: toRegularFn(app.watch[watcherName]), locked: false };
  }
  // We attach a watcher to data (so a global watcher) to call the correct watcher based on the path
  watch(
    {
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
                await watcherfn.call(
                  getContext({ state, scopedNodeData: [], config }),
                  prevValue,
                  newValue,
                  {
                    path,
                    params: match.params
                  }
                );
              } catch (err: any) {
                error(err);
              }
            }

            watchers[watcherName].locked = false;
          }
        }
      }
    },
    [state.data]
  );

  // Setup
  if (app.setup) {
    try {
      const setupFn = toRegularFn(app.setup);
      await setupFn.call(getContext({ state, scopedNodeData: [], config }));
    } catch (err: any) {
      error(err);
      return;
    }
  }

  // Setuped event dispatch
  document.dispatchEvent(
    new CustomEvent(DOMY_EVENTS.App.Setuped, {
      bubbles: true,
      detail: { app, target } as DomyReadyEventDetails
    })
  );

  const deepRender = createDeepRenderFn(state, config, components);
  try {
    // Render the dom with DOMY
    deepRender({
      element: target,
      scopedNodeData: [],
      byPassAttributes: params.byPassAttributes
    });
  } catch (err: any) {
    error(err);
  }

  // Mounted
  if (app.mounted) {
    try {
      const mountedFn = toRegularFn(app.mounted);
      await mountedFn.call(getContext({ state, scopedNodeData: [], config }));
    } catch (err: any) {
      error(err);
    }
  }

  // Mounted event dispatch
  document.dispatchEvent(
    new CustomEvent(DOMY_EVENTS.App.Mounted, {
      bubbles: true,
      detail: { app, state, target } as DomyMountedEventDetails
    })
  );

  return getRender(deepRender);
}
