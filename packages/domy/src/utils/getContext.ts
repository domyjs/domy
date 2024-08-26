import { isRef } from '../core/reactive';
import { State } from '../types/State';
import { concatProxiesAndObjs } from './concatProxiesAndObjs';
import { getHelpers } from './getHelpers';

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
export function getContext(
  el: Element | Text | undefined,
  state: State,
  scopedNodeData: Record<string, any>[] = []
) {
  const helpers = getHelpers(el, state, scopedNodeData);
  const context = concatProxiesAndObjs(
    [...scopedNodeData, state.data, state.methods, helpers],
    ({ type, obj, property, newValue }) => {
      if (type === 'get') {
        if (isRef(obj)) return obj[property].value;
        return obj[property];
      }

      if (isRef(obj)) return (obj[property].value = newValue);
      return (obj[property] = newValue);
    }
  );

  return context;
}
