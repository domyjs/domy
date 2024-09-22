import { Config } from '../types/Config';
import { State } from '../types/State';
import { getHelpers } from './getHelpers';
import { getReactiveHandler } from './getReactiveHandler';

type Props = {
  domyHelperId?: number;
  el?: Element | Text;
  state: State;
  scopedNodeData: Record<string, any>[];
  config: Config;
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

  const context = {
    ...props.state.methods,
    ...helpers
  };

  for (const key in props.state.data) {
    Object.defineProperty(context, key, getReactiveHandler(props.state.data, key));
  }

  for (const obj of props.scopedNodeData) {
    for (const key in obj) {
      Object.defineProperty(context, key, getReactiveHandler(obj, key));
    }
  }

  return context;
}
