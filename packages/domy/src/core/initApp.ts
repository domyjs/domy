import { Config } from '../types/Config';
import { State } from '../types/State';
import { error } from '../utils/logs';
import { createDeepRenderFn } from './deepRender';
import { trackDeps, isReactive, registerName } from '@domyjs/reactive';
import { getRender } from './getRender';
import { ComponentInfos, Components } from '../types/Component';
import { App } from '../types/App';
import { PluginHelper } from './plugin';
import { callWithErrorHandling } from '../utils/callWithErrorHandling';
import { onMountedTracker, onUnmountTracker, onSetupedTracker } from './hooks';
import { AppStateObserver } from './AppState';

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
  const appState = new AppStateObserver();
  const { components, config, target, app, componentInfos, appId } = params;

  // Getting app data, methods and deps
  let data: ReturnType<App> = {};
  let deps: ReturnType<typeof trackDeps> = [];
  if (app) deps = trackDeps(() => (data = app({ props: componentInfos?.componentData.$props })));

  // Calling onSetuped hooks
  appState.isSetuped = true;
  const setupedCallbacks = onSetupedTracker.getCallbacks();
  onSetupedTracker.clear();
  for (const setupedCallback of setupedCallbacks) {
    callWithErrorHandling(setupedCallback);
  }

  // State of the app
  const state: State = {
    data,
    componentInfos,
    refs: {}
  };

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

  // Get the unmountCallbaks
  const unmountCallbacks = onUnmountTracker.getCallbacks();
  onUnmountTracker.clear();

  return {
    render: getRender(deepRender),
    async unmount() {
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
