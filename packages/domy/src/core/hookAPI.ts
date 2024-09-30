import { HookAPIApp } from '../types/App';
import { Config } from '../types/Config';
import {
  DomyMountedEventDetails,
  DomyReadyEventDetails,
  DomyUnMountedEventDetails
} from '../types/Events';
import { Helpers } from '../types/Helpers';
import { State } from '../types/State';
import { getHelpers } from '../utils/getHelpers';
import { error } from '../utils/logs';
import { createDeepRenderFn } from './deepRender';
import { DOMY_EVENTS } from './DomyEvents';
import { isReactive, registerName } from '@domyjs/reactive';
import { getRender } from './getRender';
import { ComponentProps, Components } from '../types/Component';

type PromisedOrNot<T> = Promise<T> | T;
type HookAPIParams = {
  props?: ComponentProps['props'];
  onMounted: (callback: (params: { helpers: Helpers }) => PromisedOrNot<void>) => void;
  onUnMounted: (callback: (params: { helpers: Helpers }) => PromisedOrNot<void>) => void;
  helpers: Helpers;
};

export type HookAPIFnDefinition = (
  params: HookAPIParams
) => PromisedOrNot<void | Record<string, any>>;

type Params = {
  fn: HookAPIFnDefinition;
  target: HTMLElement;
  config: Config;
  components: Components;
  props?: ComponentProps;
  byPassAttributes?: string[]; // Some attribute have to be handled by an other DOMY instance in some components
};

/**
 * Hook API
 * Create DOMY App with Hooks structure
 * @param fn
 * @returns
 *
 * @author yoannchb-pro
 */
export async function hookAPI(params: Params) {
  const { props, components, config, fn, target } = params;

  const app: HookAPIApp = {
    data: {},
    methods: {}
  };

  // State of the app
  const state: State = {
    data: {},
    props,
    methods: {},
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

  // We call the setup
  const data = await fn({
    props,
    onMounted: callback => {
      app.mounted = callback;
    },
    onUnMounted: callback => {
      app.unmounted = callback;
    },
    helpers: getHelpers({
      state,
      scopedNodeData: [],
      config
    })
  });

  // We set the data and methods of the app
  if (data) {
    for (const key in data) {
      const value = data[key];
      if (typeof value === 'function') app.methods![key] = value;
      else {
        if (isReactive(value)) registerName(key, value); // To make the path as correct otherwise we will get "value" instead of "count.value" for example
        app.data![key] = value;
      }
    }
  }

  // We update the state now we have the methods and data
  state.data = app.data!;
  state.methods = app.methods!;

  // Setuped event dispatch
  document.dispatchEvent(
    new CustomEvent(DOMY_EVENTS.App.Setuped, {
      bubbles: true,
      detail: { app, target } as DomyReadyEventDetails
    })
  );

  const unmountFns: (() => void)[] = [];
  const deepRender = createDeepRenderFn(state, config, components);
  try {
    // Render the dom with DOMY
    const { unmount } = deepRender({
      element: target,
      scopedNodeData: [],
      byPassAttributes: params.byPassAttributes
    });
    unmountFns.push(unmount);
  } catch (err: any) {
    error(err);
  }

  // Mounted
  if (app.mounted) {
    try {
      await app.mounted({ helpers: getHelpers({ state, scopedNodeData: [], config }) });
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

  return {
    render: getRender(deepRender),
    async unmount() {
      for (const unmount of unmountFns) {
        unmount();
      }

      // Unmount
      if (app.unmounted) {
        try {
          await app.unmounted({ helpers: getHelpers({ state, scopedNodeData: [], config }) });
        } catch (err: any) {
          error(err);
        }
      }

      // Unmount event
      document.dispatchEvent(
        new CustomEvent(DOMY_EVENTS.App.UnMounted, {
          bubbles: true,
          detail: { app, state, target } as DomyUnMountedEventDetails
        })
      );
    }
  };
}
