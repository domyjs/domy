/* eslint @typescript-eslint/no-this-alias: "off" */

export type Listener = OnGetListener | OnSetListener;
export type OnGetListener = {
  type: 'onGet';
  fn: (props: { obj: any; path: string }) => void;
};
export type OnSetListener = {
  type: 'onSet';
  fn: (props: { obj: any; path: string; prevValue: any; newValue: any }) => void | Promise<void>;
};

export const isProxySymbol = Symbol();
export const isSignalSymbol = Symbol();
export const skipReactivitySymbol = Symbol();

/**
 * Allow to create a DeepProxy to listen to any change into an object
 * @author yoannchb-pro
 */
export class ReactiveVariable {
  public name = '';
  private proxy: any = null;

  private onSetListeners: OnSetListener['fn'][] = [];
  private onGetListeners: OnGetListener['fn'][] = [];

  private proxyQueue: (() => void)[] = [];
  private queued = false;

  public static IS_GLOBAL_LOCK = false;

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

  public getInitialObj() {
    return this.target;
  }

  public clearProxy() {
    this.proxy = null;
  }

  public clearListeners() {
    this.onGetListeners = [];
    this.onSetListeners = [];
  }

  public attachListener(l: Listener) {
    const listeners = l.type === 'onGet' ? this.onGetListeners : this.onSetListeners;
    listeners.push(l.fn);
  }

  public removeListener(l: Listener) {
    const listeners = l.type === 'onGet' ? this.onGetListeners : this.onSetListeners;
    const index = listeners.indexOf(l.fn);
    if (index !== -1) listeners.splice(index, 1);
  }

  private canAttachProxy(target: any) {
    return (
      target !== null &&
      typeof target === 'object' &&
      !ReactiveVariable.isReactive(target) &&
      !target?.[skipReactivitySymbol]
    );
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

  private proxyQueueAction(action: () => void) {
    this.proxyQueue.push(action);

    if (!this.queued) {
      this.queued = true;

      for (const job of this.proxyQueue) {
        job(); // Errors are already handled in createProxy method
      }

      this.proxyQueue.length = 0;
      this.queued = false;
    }
  }

  private createProxy(target: any, path: string[] = []): any {
    if (!this.canAttachProxy(target)) return target;

    try {
      for (const key in target) {
        if (this.canAttachProxy(target[key]))
          this.proxyQueueAction(
            () => (target[key] = this.createProxy(target[key], [...path, key]))
          );
      }

      const isCollection = this.isCollection(target);
      target[isProxySymbol] = true;
      const prox = new Proxy(
        target,
        isCollection ? this.createCollectionHandler(path) : this.createHandler(path)
      );

      return prox;
    } catch (err) {
      return target;
    }
  }

  private callOnGetListeners(path: string[]) {
    if (!ReactiveVariable.IS_GLOBAL_LOCK) {
      const params = {
        path: this.name + path.join('.'),
        obj: this.getProxy()
      };

      for (const listener of this.onGetListeners) {
        listener(params);
      }
    }
  }

  private callOnSetListeners(path: string[], prevValue: any, newValue: any) {
    if (!ReactiveVariable.IS_GLOBAL_LOCK) {
      const params = {
        path: this.name + path.join('.'),
        prevValue,
        newValue,
        obj: this.getProxy()
      };

      for (const listener of this.onSetListeners) {
        listener(params);
      }
    }
  }
}
