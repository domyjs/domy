import { HookAPIApp } from '../types/App';
import { Config } from '../types/Config';
import { DomyMountedEventDetails, DomyReadyEventDetails } from '../types/Events';
import { Helpers } from '../types/Helpers';
import { State } from '../types/State';
import { getHelpers } from '../utils/getHelpers';
import { error } from '../utils/logs';
import { createConfigurableDeepRender } from './deepRender';
import { DOMY_EVENTS } from './DomyEvents';
import { isReactive, registerName } from './reactive';

type PromisedOrNot<T> = Promise<T> | T;
type HookAPIParams = {
  onMounted: (callback: (props: { helpers: Helpers }) => PromisedOrNot<void>) => void;
  helpers: Helpers;
};

export type HookAPIFnDefinition = (
  params: HookAPIParams
) => PromisedOrNot<void | Record<string, any>>;

/**
 * Hook API
 * Create DOMY App with Hooks structure
 * @param fn
 * @returns
 *
 * @author yoannchb-pro
 */
export async function hookAPI(fn: HookAPIFnDefinition, target: HTMLElement, config: Config) {
  const app: HookAPIApp = {
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
      const deepRender = createConfigurableDeepRender(config);
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
