/* eslint @typescript-eslint/no-this-alias: "off" */

type MatchingResult = { isMatching: boolean; params: Record<string, string> };

type GetListenerByType<T> = T extends 'onGet' ? OnGetListener : OnSetListener;
export type Listener = OnGetListener | OnSetListener;
export type OnGetListener = { type: 'onGet'; fn: (props: { path: string }) => void };
export type OnSetListener = {
  type: 'onSet';
  fn: (props: { path: string; prevValue: any; newValue: any }) => void | Promise<void>;
};

const isProxySymbol = Symbol('isProxy');
const reactivesVariablesList: ReactiveVariable[] = [];
const globalListenersList: Listener[] = [];

/**
 * Allow to create a DeepProxy to listen to any change into an object
 * @author yoannchb-pro
 */
class ReactiveVariable {
  private proxy: any = null;

  private onSetListeners: OnSetListener['fn'][] = [];
  private onGetListeners: OnGetListener['fn'][] = [];

  constructor(private target: any) {}

  public getProxy() {
    if (!this.proxy) this.proxy = this.createProxy(this.target);
    return this.proxy;
  }

  /**
   * Check if the current target is already a proxy
   * @param target
   * @returns
   */
  public static isReactive(target: any) {
    return !!target?.[isProxySymbol];
  }

  public attachListener(l: Listener) {
    switch (l.type) {
      case 'onGet':
        this.onGetListeners.push(l.fn);
        break;
      case 'onSet':
        this.onSetListeners.push(l.fn);
        break;
    }
  }

  public removeListener(l: Listener) {
    let listeners: Listener['fn'][] = [];
    switch (l.type) {
      case 'onGet':
        listeners = this.onGetListeners;
        break;
      case 'onSet':
        listeners = this.onSetListeners;
        break;
    }

    const index = listeners.indexOf(l.fn);
    if (index !== -1) listeners.splice(index, 1);
  }

  private canAttachProxy(target: any) {
    return target !== null && typeof target === 'object';
  }

  private isCollection(target: any) {
    return (
      target instanceof Set ||
      target instanceof WeakMap ||
      target instanceof WeakSet ||
      target instanceof Map
    );
  }

  private createCollectionHandler(path: string[]) {
    const ctx = this;
    const collectionHandler: ProxyHandler<any> = {
      get(target, property, receiver) {
        if (typeof property === 'symbol') {
          return Reflect.get(target, property, receiver);
        }

        const value = Reflect.get(target, property, receiver);
        const fullPath = [...path, property as string];

        if (typeof value === 'function') {
          return function (...args: any[]) {
            let prevValue, newValue;

            switch (property) {
              case 'add':
                if (target instanceof Set) {
                  prevValue = new Set(target);
                  newValue = new Set(target).add(args[0]);
                }
                break;
              case 'set':
                if (target instanceof Map) {
                  prevValue = new Map(target);
                  newValue = new Map(target).set(args[0], args[1]);
                }
                break;
              case 'delete':
                if (target instanceof Set) {
                  prevValue = new Set(target);
                  newValue = new Set(target);
                  newValue.delete(args[0]);
                } else if (target instanceof Map) {
                  prevValue = new Map(target);
                  newValue = new Map(target);
                  newValue.delete(args[0]);
                }
                break;
              case 'clear':
                if (target instanceof Set || target instanceof Map) {
                  prevValue = target instanceof Set ? new Set(target) : new Map(target);
                  newValue = target instanceof Set ? new Set() : new Map();
                }
                break;
            }

            // If the new value is not a proxy we declare a proxy for it
            const isNewObj = ['add', 'set'].includes(property as string);
            const obj = args[args.length - 1]; // In case of a set(key, obj) and add(obj)
            if (isNewObj && !ReactiveVariable.isReactive(obj)) {
              args[args.length - 1] = ctx.createProxy(obj, fullPath);
            }

            const result = value.apply(target, args);

            if (['add', 'set', 'delete', 'clear'].includes(property as string)) {
              ctx.callOnSetListeners(path, prevValue, newValue);
            }

            return result;
          };
        } else {
          ctx.callOnGetListeners(fullPath);
          return value;
        }
      }
    };
    return collectionHandler;
  }

  private createHandler(path: string[]) {
    const ctx = this;
    const handler: ProxyHandler<any> = {
      get(target, p, receiver) {
        if (typeof p === 'symbol') {
          return Reflect.get(target, p, receiver);
        }

        ctx.callOnGetListeners([...path, p as string]);
        return Reflect.get(target, p, receiver);
      },

      set(target, p, newValue, receiver) {
        if (typeof p === 'symbol') {
          return Reflect.set(target, p, newValue, receiver);
        }

        const prevValue = Reflect.get(target, p, receiver);
        const fullPath = [...path, p as string];

        // If the new value is not a proxy we declare a proxy for it
        const isNewObj = !ReactiveVariable.isReactive(newValue);
        if (isNewObj) {
          newValue = ctx.createProxy(newValue, fullPath);
        }

        const result = Reflect.set(target, p, newValue, receiver);
        const isSameValue = prevValue === newValue;
        if (result && !isSameValue) {
          ctx.callOnSetListeners(fullPath, prevValue, newValue);
        }

        return result;
      }
    };
    return handler;
  }

  private createProxy(target: any, path: string[] = []): any {
    if (!this.canAttachProxy(target) || ReactiveVariable.isReactive(target)) return target;

    try {
      for (const key in target) {
        const isAlreadyProxy = ReactiveVariable.isReactive(target[key]);
        if (!isAlreadyProxy) target[key] = this.createProxy(target[key], [...path, key]);
      }
      const isCollection = this.isCollection(target);
      const prox = new Proxy(
        target,
        isCollection ? this.createCollectionHandler(path) : this.createHandler(path)
      );
      prox[isProxySymbol] = true;
      return prox;
    } catch (err) {
      return target;
    }
  }

  private callOnGetListeners(path: string[]) {
    for (const listener of this.onGetListeners) {
      listener({ path: path.join('.') });
    }
  }

  private callOnSetListeners(path: string[], prevValue: any, newValue: any) {
    for (const listener of this.onSetListeners) {
      listener({ path: path.join('.'), prevValue, newValue });
    }
  }
}

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
  reactivesVariablesList.push(reactiveVariable);

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

  return reactiveVariable.getProxy();
}

/**
 * Transform a primitive into a reactive object to listen to any change
 * @param obj
 * @returns
 *
 * @author yoannchb-pro
 */
export function ref<T>(obj: T): { value: T } {
  return reactive({ value: obj });
}

/**
 * Attach a listener to all reactive variables
 * @param listener
 *
 * @author yoannchb-pro
 */
export function globalWatch(listener: Listener) {
  globalListenersList.push(listener);
}

/**
 * Remove a global listener
 * @param listener
 *
 * @author yoannchb-pro
 */
export function removeGlobalWatch(listener: Listener) {
  const index = globalListenersList.findIndex(l => l === listener);
  globalListenersList.splice(index, 1);
}

/**
 * Attach a listener to some reactives variables
 * @param fn
 * @param objsToWatch
 *
 * @author yoannchb-pro
 */
export function watch(listener: Listener, objsToWatch: unknown[]) {
  const variablesToWatch = reactivesVariablesList.filter(obj => objsToWatch.includes(obj));
  for (const reactiveVariable of variablesToWatch) {
    reactiveVariable.attachListener(listener);
  }
}

/**
 * Remove a listener from some reactives variables
 * @param fn
 * @param objsToWatch
 *
 * @author yoannchb-pro
 */
export function unwatch(listener: Listener, objsToUnwatch: unknown[]) {
  const variablesToWatch = reactivesVariablesList.filter(obj => objsToUnwatch.includes(obj));
  for (const reactiveVariable of variablesToWatch) {
    reactiveVariable.removeListener(listener);
  }
}

/**
 * Check if a path match a certain rule
 * Example:
 * path: todos.0.isComplete
 * reg: todos.*.isComplete or todos, todos.* or todos.*.*
 * Will give true
 * reg: todos.1.isComplete, todos.*.name, todos.*.*.id
 * Will give false
 * @param reg
 * @param path
 * @returns
 *
 * @author yoannchb-pro
 */
export function matchPath(reg: string, path: string): MatchingResult {
  const defaultRes: MatchingResult = {
    isMatching: false,
    params: {}
  };

  const rules = reg.split('.');
  const paths = path.split('.');

  const params: Record<string, string> = {};

  for (let i = 0; i < rules.length; ++i) {
    if (!path[i]) return defaultRes;

    const isParam = rules[i].match(/\{\w+\}/);
    if (rules[i] === '*' || isParam) {
      if (isParam) {
        const paramName = isParam[0];
        params[paramName.substring(1, paramName.length - 1)] = paths[i];
      }
      continue;
    }

    if (paths[i] !== rules[i]) return defaultRes;
  }

  return { isMatching: true, params };
}
