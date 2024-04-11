import { PLUGINS } from '../core/registerPlugin';
import { State } from '../types/State';

/**
 * Create fake data to provide an object with the same keys but a null value
 * @param obj
 * @returns
 *
 * @author yoannchb-pro
 */
function createFakeData(obj: Record<string, any>) {
  return Object.keys(obj).reduce((a, b) => ({ ...a, [b]: null }), {});
}

/**
 * Return a context with all what domy need to render
 * Like variables, methods, specials ...
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
  const stateDatas = state.data.reactiveObj;

  const contextProxyHandler: ProxyHandler<any> = {
    get(target, property, receiver) {
      if (typeof property === 'symbol') return Reflect.get(target, property, receiver);

      // We handle the case we want to get back some reactive data (because proxy destructuration doesn't work)
      if (property in stateDatas) {
        return stateDatas[property];
      } else {
        for (const injectableData of scopedNodeData) {
          if (property in injectableData) {
            return injectableData[property];
          }
        }
      }

      return Reflect.get(target, property, receiver);
    },
    set(target, property, newValue, receiver) {
      if (typeof property === 'symbol') return Reflect.set(target, property, newValue, receiver);

      // We handle the case we want to get back some reactive data (because proxy destructuration doesn't work)
      if (property in stateDatas) {
        return (stateDatas[property] = newValue);
      } else {
        for (const injectableData of scopedNodeData) {
          if (property in injectableData) {
            return (injectableData[property] = newValue);
          }
        }
      }

      return Reflect.set(target, property, newValue, receiver);
    }
  };

  // We create fake key with a null value because otherwise we have a reference error in the with(){ }
  const fakeDatas = createFakeData(stateDatas);
  const fakeInjectableDatas = scopedNodeData.reduce((a, b) => ({ ...a, ...createFakeData(b) }), {});

  // we init the specials
  const specials: any = {};
  for (const [name, fn] of Object.entries(PLUGINS.specials)) {
    specials['$' + name] = fn({
      el,
      state,
      scopedNodeData
    });
  }

  const context = new Proxy(
    {
      ...fakeDatas,
      ...fakeInjectableDatas,

      ...state.methods,

      ...specials
    },
    contextProxyHandler
  );

  return context;
}
