import { State } from '../types/State';
import { concatProxiesAndObjs } from './concatProxiesAndObjs';
import { getHelpers } from './getHelpers';
import { isSignal } from '@domyjs/reactive';

type Props = {
  domyHelperId?: number;
  el?: Element | Text;
  state: State;
  scopedNodeData: Record<string, any>[];
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

  const context = concatProxiesAndObjs(
    // We put scoped datas at first place to ensure it override data
    [...props.scopedNodeData, props.state.data, props.state.methods, helpers],
    ({ type, obj, property, newValue }) => {
      const isObjSignal = isSignal(obj[property]);
      switch (type) {
        case 'get':
          if (isObjSignal) return obj[property].value;
          return obj[property];
        case 'set':
          if (isObjSignal) return (obj[property].value = newValue);
          return (obj[property] = newValue);
      }
    }
  );

  return context;
}
