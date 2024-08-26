import { CompositionApiApp } from '../types/App';
import { DomyMountedEventDetails, DomyReadyEventDetails } from '../types/Events';
import { State } from '../types/State';
import { getHelpers } from '../utils/getHelpers';
import { error } from '../utils/logs';
import { DOMY_EVENTS } from './DomyEvents';
import { deepRender } from './deepRender';
import { isReactive, registerName } from './reactive';

type PromisedOrNot<T> = Promise<T> | T;
type Helpers = Record<`$${string}`, any>;
type CompositionAPIParams = {
  onMounted: (callback: (props: { helpers: Helpers }) => PromisedOrNot<void>) => void;
  helpers: Helpers;
};
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
export async function compositionAPI(fn: CompositionAPIFn, target: HTMLElement) {
  const app: CompositionApiApp = {
    data: {},
    methods: {}
  };

  // State of the app
  const state: State = {
    data: {},
    methods: app.methods!,
    events: {},
    refs: {},
    transitions: new Map()
  };

  // Initialisation event dispatch
  document.dispatchEvent(
    new CustomEvent(DOMY_EVENTS.App.Initialisation, {
      bubbles: true,
      detail: { app, target } as DomyReadyEventDetails
    })
  );

  const data = await fn({
    onMounted: callback => {
      app.mounted = callback;
    },
    helpers: getHelpers(undefined, state)
  });

  // We set the data and methods of the app
  if (data) {
    for (const key in data) {
      const value = data[key];
      if (typeof value === 'function') app.methods![key] = value;
      else {
        if (isReactive(value)) registerName(key, value); // To make the path as correct otherwise we will get "value" instead of "count.value"
        app.data![key] = value;
      }
    }
  }

  state.data = app.data!;

  // Setuped event dispatch
  document.dispatchEvent(
    new CustomEvent(DOMY_EVENTS.App.Setuped, {
      bubbles: true,
      detail: { app, target } as DomyReadyEventDetails
    })
  );

  // Init domy
  if (document.readyState === 'complete') {
    await mountApp();
  } else document.addEventListener('DOMContentLoaded', mountApp);

  async function mountApp() {
    try {
      deepRender({
        element: target,
        state
      });
    } catch (err: any) {
      error(err);
    }

    // Mounted
    if (app.mounted) {
      try {
        await app.mounted({ helpers: getHelpers(undefined, state) });
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
  }
}
