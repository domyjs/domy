/* eslint @typescript-eslint/no-this-alias: "off" */
export type Listener = OnGetListener | OnSetListener;
export type OnGetListener = {
  type: 'onGet';
  fn: (props: { reactiveVariable: ReactiveVariable; path: string }) => void;
};
export type OnSetListener = {
  type: 'onSet';
  fn: (props: {
    reactiveVariable: ReactiveVariable;
    path: string;
    prevValue: any;
    newValue: any;
  }) => void | Promise<void>;
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

  private onSetListeners = new Set<OnSetListener['fn']>();
  private onGetListeners = new Set<OnGetListener['fn']>();

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
  public static isReactive(target: any): boolean {
    return !!target?.[isProxySymbol];
  }

  /**
   * Check if the current target is a signal instead of a reactive
   * @param target
   * @returns
   */
  public static isSignal(target: any): boolean {
    return target?.[isSignalSymbol] && 'value' in target;
  }

  /**
   * Check we should skip the reactivity on the current element
   * @param target
   * @returns
   */
  public static shouldBeSkip(target: any): boolean {
    return target?.[skipReactivitySymbol];
  }

  public clearListeners() {
    this.onGetListeners.clear();
    this.onSetListeners.clear();
  }

  public attachListener(l: Listener) {
    const listeners = l.type === 'onGet' ? this.onGetListeners : this.onSetListeners;
    listeners.add(l.fn);
    return () => this.removeListener(l);
  }

  public removeListener(l: Listener) {
    const listeners = l.type === 'onGet' ? this.onGetListeners : this.onSetListeners;
    listeners.delete(l.fn);
  }

  private canAttachProxy(target: any) {
    return (
      target !== null &&
      typeof target === 'object' &&
      !ReactiveVariable.isReactive(target) &&
      !ReactiveVariable.shouldBeSkip(target)
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
        if (typeof p === 'symbol') return Reflect.get(target, p, receiver);

        let value = Reflect.get(target, p, receiver);
        const fullPath = [...path, p as string];

        // Ensure the needed variable is reactive
        if (!ReactiveVariable.isReactive(value)) {
          value = ctx.createProxy(value, fullPath);
          Reflect.set(target, p, value);
        }

        ctx.callOnGetListeners(fullPath);
        return value;
      },

      set(target, p, newValue, receiver) {
        if (typeof p === 'symbol') return Reflect.set(target, p, newValue, receiver);

        const prevValue = Reflect.get(target, p, receiver);
        const fullPath = [...path, p as string];
        const result = Reflect.set(target, p, newValue, receiver);

        const isSameValue = prevValue === newValue;
        if (result && !isSameValue) ctx.callOnSetListeners(fullPath, prevValue, newValue);

        return result;
      },

      deleteProperty(target, p) {
        if (typeof p === 'symbol') return Reflect.deleteProperty(target, p);

        const prevValue = target[p];
        const fullPath = [...path, p as string];

        const result = Reflect.deleteProperty(target, p);
        if (result) ctx.callOnSetListeners(fullPath, prevValue, undefined);

        return result;
      },

      has(target, p) {
        const exists = Reflect.has(target, p);
        const fullPath = [...path, p as string];
        ctx.callOnGetListeners(fullPath);
        return exists;
      },

      ownKeys(target) {
        const keys = Reflect.ownKeys(target);
        ctx.callOnGetListeners([...path]);
        return keys;
      }
    };
    return handler;
  }

  private createProxy(target: any, path: string[] = []): any {
    if (!this.canAttachProxy(target)) return target;

    const isCollection = this.isCollection(target);

    Object.defineProperty(target, isProxySymbol, {
      enumerable: false,
      writable: true,
      value: true,
      configurable: true
    });

    return new Proxy(
      target,
      isCollection ? this.createCollectionHandler(path) : this.createHandler(path)
    );
  }

  private callOnGetListeners(path: string[]) {
    if (ReactiveVariable.IS_GLOBAL_LOCK) return;

    const params = {
      path: this.name + path.join('.'),
      reactiveVariable: this
    };

    for (const listener of [...this.onGetListeners]) {
      listener(params);
    }
  }

  private callOnSetListeners(path: string[], prevValue: any, newValue: any) {
    if (ReactiveVariable.IS_GLOBAL_LOCK) return;

    const params = {
      path: this.name + path.join('.'),
      prevValue,
      newValue,
      reactiveVariable: this
    };

    for (const listener of [...this.onSetListeners]) {
      listener(params);
    }
  }
}
