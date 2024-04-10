export type OnGetListener = { type: 'onGet'; fn: (props: { path: string }) => void };

export type OnSetListener = {
  type: 'onSet';
  fn: (props: { path: string; prevValue: any; newValue: any }) => void;
};

export type Listener = OnGetListener | OnSetListener;

const isProxySymbol = Symbol('isProxy');

/**
 * Allow to create a DeepProxy to listen to any change into an object
 * @author yoannchb-pro
 */
class DeepProxy {
  private proxy: any = null;

  private onSetListeners: OnSetListener['fn'][] = [];
  private onGetListeners: OnGetListener['fn'][] = [];

  constructor(private target: any) {}

  public getProxy() {
    if (!this.proxy) this.proxy = this.createProxy(this.target);
    return this.proxy;
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
   */
  public static matchPath(reg: string, path: string) {
    const rules = reg.split('.');
    const paths = path.split('.');

    for (let i = 0; i < rules.length; ++i) {
      if (rules[i] === '*') continue;

      if (!paths[i] || paths[i] !== rules[i]) return false;
    }

    return true;
  }

  /**
   * Check if the current target is already a proxy
   * @param target
   * @returns
   */
  public static isReactive(target: any) {
    return !!target[isProxySymbol];
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

  public removeEventListener(l: Listener) {
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
            if (isNewObj && !DeepProxy.isReactive(obj)) {
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
        const isNewObj = !DeepProxy.isReactive(newValue);
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
    if (!this.canAttachProxy(target) || DeepProxy.isReactive(target)) return target;

    try {
      for (const key in target) {
        const isAlreadyProxy = DeepProxy.isReactive(target[key]);
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

export function reactive<T extends Record<string, any>>(obj: T) {
  const deepProxy = new DeepProxy(obj);
  return {
    reactiveObj: deepProxy.getProxy() as T,
    matchPath: DeepProxy.matchPath,
    isReactive: DeepProxy.isReactive,
    attachListener: deepProxy.attachListener.bind(deepProxy),
    removeListener: deepProxy.removeEventListener.bind(deepProxy)
  };
}

// const obs = reactive({
//   count: 0,
//   mapTest: new Map(),
//   clients: new Set(['Pierre', 'Lucas']),
//   todos: [{ id: 0, name: 'Clean computer', isComplete: false }],
//   user: {
//     name: 'Yoann',
//     lastName: 'Chb'
//   }
// });

// const data = obs.reactiveObj;

// obs.attachListener({
//   type: 'onGet',
//   fn: ({ path }) => {
//     console.log('get', path);
//   }
// });

// obs.attachListener({
//   type: 'onSet',
//   fn: ({ path, prevValue, newValue }) => {
//     console.log('set', path, prevValue, newValue);
//   }
// });

// data.todos[0].isComplete = true;
// data.todos.push({ id: 2, name: 'Testing app', isComplete: false });
// data.todos[1].isComplete = true;
// data.user;
// data.user.adresse = { city: 'France' };
// data.user.adresse = { city: 'Montréal' };
// data.user.adresse.city = 'Unknown';
// data.clients.add('Jean');
