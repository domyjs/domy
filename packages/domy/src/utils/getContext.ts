import { Config } from '../types/Config';
import { State } from '../types/State';
import { getHelpers } from './getHelpers';
import { PluginHelper } from '../core/plugin';
import { isSignal } from '@domyjs/reactive';
import { getSignalHandler } from './getReactiveHandler';

type Props = {
  domyHelperId?: number;
  el?: Element | Text;
  state: State;
  scopedNodeData: Record<string, any>[];
  config: Config;
  pluginHelper: PluginHelper;
};

/**
 * Return a context with all what domy need to render
 * Like variables, methods, helpers ...
 * @param el
 * @param state
 * @param scopedNodeData
 * @returns
 *
 * @author yoannchb-pro
 */
export function getContext(props: Props) {
  const helpers = getHelpers(props);

  const context: Record<string, unknown> = {
    ...helpers
  };

  for (const obj in props.state.data) {
    if (isSignal(obj)) Object.defineProperty(context, obj, getSignalHandler(props.state.data, obj));
    else context[obj] = props.state.data[obj];
  }

  for (const obj of props.scopedNodeData) {
    for (const key in obj) {
      if (isSignal(obj[key])) Object.defineProperty(context, key, getSignalHandler(obj, key));
      else context[key] = obj[key];
    }
  }

  return context;
}
