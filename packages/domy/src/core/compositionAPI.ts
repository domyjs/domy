import { App } from '../types/App';
import { DomyMountedEventDetails, DomyReadyEventDetails } from '../types/Events';
import { State } from '../types/State';
import { error } from '../utils/logs';
import { DOMY_EVENTS } from './DomyEvents';
import { deepRender } from './deepRender';

type PromisedOrNot<T> = Promise<T> | T;
type CompositionAPIParams = { onMounted: (callback: () => PromisedOrNot<void>) => void };
export type CompositionAPIFn = (
  params: CompositionAPIParams
) => PromisedOrNot<void | Record<string, any>>;

/**
 * Composition API
 * Create DOMY App with Hooks structure
 * @param fn
 * @returns
 *
 * @author yoannchb-pro
 */
export async function compositionAPI(fn: CompositionAPIFn) {
  const domTarget = document.body; // TODO

  const app: App = {
    data: {},
    methods: {}
  };

  // Initialisation event dispatch
  document.dispatchEvent(
    new CustomEvent(DOMY_EVENTS.App.Initialisation, {
      bubbles: true,
      detail: { app, target: domTarget } as DomyReadyEventDetails
    })
  );

  const data = await fn({
    onMounted: callback => {
      app.mounted = callback;
    }
  });

  // We set the data and methods of the app
  if (data) {
    for (const key in data) {
      if (typeof data[key] === 'function') app.methods![key] = data[key];
      else app.data![key] = data[key];
    }
  }

  // State of the app
  const state: State = {
    data: app.data!,
    methods: app.methods!,
    events: {},
    refs: {},
    transitions: new Map()
  };

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
        await app.mounted();
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
