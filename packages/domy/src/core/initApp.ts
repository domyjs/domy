import { Config } from '../types/Config';
import {
  DomyMountedEventDetails,
  DomyReadyEventDetails,
  DomyUnMountEventDetails
} from '../types/Events';
import { State } from '../types/State';
import { getContext } from '../utils/getContext';
import { error } from '../utils/logs';
import { toRegularFn } from '../utils/toRegularFn';
import { DOMY_EVENTS } from './DomyEvents';
import { createDeepRenderFn } from './deepRender';
import { reactive, watch, matchPath, unReactive } from '@domyjs/reactive';
import { getRender } from './getRender';
import { ComponentInfos, Components } from '../types/Component';
import type { OnSetListener } from '@domyjs/reactive/src/core/ReactiveVariable';
import { App } from '../types/App';
import { getUniqueQueueId, queueJob } from './scheduler';
import { queuedWatchEffect } from '../utils/queuedWatchEffect';
import { PluginHelper } from './plugin';

type Params = {
  appId: number;
  app?: App;
  target: HTMLElement;
  config: Config;
  components: Components;
  componentInfos?: ComponentInfos;
  pluginHelper: PluginHelper;
  byPassAttributes?: string[]; // Some attribute have to be handled by an other DOMY instance in some components
};

/**
 * App initialisation
 * @param app
 * @returns
 *
 * @author yoannchb-pro
 */
export async function initApp(params: Params) {
  let unmountRender: (() => void) | null = null;
  const { components, config, target, app = {}, componentInfos } = params;

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
    componentInfos,
    methods: {},
    refs: {}
  };

  const contextProps: Parameters<typeof getContext>[0] = {
    state,
    scopedNodeData: [],
    config,
    pluginHelper: params.pluginHelper
  };

  // Methods
  for (const key in app.methods) {
    const method = toRegularFn(app.methods[key]);
    state.methods[key] = function (...args: any[]) {
      return method.call(getContext(contextProps), ...args);
    };
  }

  // Watchers
  const watchers: Record<string, { fn: OnSetListener['fn']; id: number }> = {};
  // We convert all watcher function to regular function so we can change the context
  for (const watcherName in app.watch) {
    watchers[watcherName] = {
      id: getUniqueQueueId(),
      fn: toRegularFn(app.watch[watcherName])
    };
  }
  // We attach a watcher to data (so a global watcher) to call the correct watcher based on the path
  watch(
    {
      type: 'onSet',
      fn: async props => {
        for (const watcherName in app.watch) {
          const match = matchPath(watcherName, props.path);

          if (match.isMatching) {
            const watcher = watchers[watcherName];

            queueJob(async () => {
              try {
                await watcher.fn.call(getContext(contextProps), props);
              } catch (err: any) {
                error(err);
              }
            }, watcher.id);
          }
        }
      }
    },
    () => [state.data, state.componentInfos?.componentData]
  );

  // Setup
  if (app.setup) {
    try {
      const setupFn = toRegularFn(app.setup);
      await setupFn.call(getContext(contextProps));
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

  const deepRender = createDeepRenderFn(
    params.appId,
    state,
    config,
    components,
    params.pluginHelper
  );
  try {
    // Render the dom with DOMY
    const block = deepRender({
      element: target,
      scopedNodeData: [],
      byPassAttributes: params.byPassAttributes
    });
    unmountRender = block.unmount.bind(block);
  } catch (err: any) {
    error(err);
  }

  // Mounted
  if (app.mounted) {
    try {
      const mountedFn = toRegularFn(app.mounted);
      await mountedFn.call(getContext(contextProps));
    } catch (err: any) {
      error(err);
    }
  }

  // Effects
  for (const effect of app.effect ?? []) {
    const fn = toRegularFn(effect);
    queuedWatchEffect(fn.bind(getContext(contextProps)));
  }

  // Mounted event dispatch
  document.dispatchEvent(
    new CustomEvent(DOMY_EVENTS.App.Mounted, {
      bubbles: true,
      detail: { appId: params.appId, app, state, target } as DomyMountedEventDetails
    })
  );

  return {
    render: getRender(deepRender),
    async unmount() {
      if (unmountRender) unmountRender();

      // Unmount
      if (app.unmount) {
        try {
          const unmountedFn = toRegularFn(app.unmount);
          await unmountedFn.call(getContext(contextProps));
        } catch (err: any) {
          error(err);
        }
      }

      unReactive(state.data);

      // Unmount event
      document.dispatchEvent(
        new CustomEvent(DOMY_EVENTS.App.UnMount, {
          bubbles: true,
          detail: { app, state, target } as DomyUnMountEventDetails
        })
      );
    }
  };
}
