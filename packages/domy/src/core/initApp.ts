import { Config } from '../types/Config';
import { State } from '../types/State';
import { error } from '../utils/logs';
import { createDeepRenderFn } from './deepRender';
import { trackDeps } from '@domyjs/reactive';
import { getRender } from './getRender';
import { ComponentInfos, Components } from '../types/Component';
import { App } from '../types/App';
import { PluginHelper } from './plugin';
import { callWithErrorHandling } from '../utils/callWithErrorHandling';
import {
  onMountedTracker,
  onUnmountTracker,
  onSetupedTracker,
  helperToHookRegistrer,
  onBeforeUnmountTracker
} from './hooks';
import { AppStateObserver } from './AppState';
import * as ReactiveUtils from '@domyjs/reactive';
import { helpersUtils } from '../utils/helpersUtils';

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
export function initApp(params: Params) {
  let unmountRender: (() => void) | null = null;
  const appState = new AppStateObserver();
  const { components, config, target, app, componentInfos } = params;

  // State of the app
  const state: State = {
    data: {},
    componentInfos,
    refs: {}
  };

  // Initialising hooks
  helperToHookRegistrer.provideHookMandatories({
    config,
    scopedNodeData: [] as Record<string, any>[],
    state,
    ...ReactiveUtils,
    utils: helpersUtils
  });

  // Getting app data, methods and deps
  let deps: ReturnType<typeof trackDeps> = [];
  if (app) deps = trackDeps(() => (state.data = app()));

  // Calling onSetuped hooks
  appState.isSetuped = true;
  const setupedCallbacks = onSetupedTracker.getCallbacks();
  onSetupedTracker.clear();
  for (const setupedCallback of setupedCallbacks) {
    callWithErrorHandling(setupedCallback);
  }

  // Render the dom with DOMY
  const deepRender = createDeepRenderFn(
    params.appId,
    appState,
    state,
    config,
    components,
    params.pluginHelper
  );
  try {
    const block = deepRender({
      element: target,
      scopedNodeData: [],
      byPassAttributes: params.byPassAttributes
    });
    unmountRender = block.unmount.bind(block);
  } catch (err: any) {
    error(err);
  }

  // Calling onMounted hooks
  appState.isMounted = true;
  const mountedCallbacks = onMountedTracker.getCallbacks();
  onMountedTracker.clear();
  for (const mountedCallback of mountedCallbacks) {
    callWithErrorHandling(mountedCallback);
  }

  // Get the beforeUnmount callbacks
  const beforeUnmountCallbacks = onBeforeUnmountTracker.getCallbacks();
  onBeforeUnmountTracker.clear();

  // Get the unmount callbaks
  const unmountCallbacks = onUnmountTracker.getCallbacks();
  onUnmountTracker.clear();

  return {
    render: getRender(deepRender),
    async unmount() {
      // Calling onBeforeUnmount hooks
      for (const beforeUnmountCallback of beforeUnmountCallbacks) {
        callWithErrorHandling(beforeUnmountCallback);
      }

      // We clean the dependencies of the current app/component
      for (const dep of deps) {
        dep.clean();
      }

      // unmount every deep component, ...
      if (unmountRender) unmountRender();

      // Calling onUnmount hooks
      appState.isUnmounted = true;
      for (const unmountCallback of unmountCallbacks) {
        callWithErrorHandling(unmountCallback);
      }
    }
  };
}
