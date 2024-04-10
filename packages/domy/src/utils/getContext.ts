import { dispatchCustomEvent } from './dispatchCustomEvent';
import { State } from '../types/State';

function createFakeData(obj: Record<string, any>) {
  return Object.keys(obj).reduce((a, b) => ({ ...a, [b]: null }), {});
}

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

  const context = new Proxy(
    {
      ...fakeDatas,
      ...fakeInjectableDatas,
      ...state.methods,
      $el: el,
      $refs: state.refs,
      $dispatch: dispatchCustomEvent(state)
    },
    contextProxyHandler
  );

  return context;
}
