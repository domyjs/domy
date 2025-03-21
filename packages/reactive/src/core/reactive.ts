import { globalListenersList, reactivesVariablesList } from './data';
import { Listener, OnGetListener, OnSetListener, ReactiveVariable } from './ReactiveVariable';
import { trackCallback } from './trackDeps';
import { unReactive } from './unReactive';

type GetListenerByType<T> = T extends 'onGet' ? OnGetListener : OnSetListener;

/**
 * Transform an object into a reactive object to listen to any change
 * @param obj
 * @returns
 *
 * @author yoannchb-pro
 */
export function reactive<T>(obj: T): T {
  if (ReactiveVariable.isReactive(obj)) return obj;

  const reactiveVariable = new ReactiveVariable(obj);
  const proxy = reactiveVariable.getProxy();
  reactivesVariablesList.set(proxy, reactiveVariable);

  // We attach the global listener
  function createGlobalListener<T extends Listener['type']>(type: T): GetListenerByType<T>['fn'] {
    return (props: any) => {
      const globalListenerByType = globalListenersList.filter(
        curr => curr.type === type
      ) as GetListenerByType<T>[];

      for (const globalListener of globalListenerByType) {
        try {
          globalListener.fn(props);
        } catch (err) {
          console.error(err);
        }
      }
    };
  }

  reactiveVariable.attachListener({
    type: 'onGet',
    fn: createGlobalListener('onGet')
  });
  reactiveVariable.attachListener({
    type: 'onSet',
    fn: createGlobalListener('onSet')
  });

  // Tracking the reactive creation
  if (trackCallback)
    trackCallback({
      type: 'reactive_variable_creation',
      reactiveVariable,
      clean: () => unReactive(reactiveVariable)
    });

  return proxy;
}
