type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void
  ? I
  : never;

type Transformer = (props: {
  type: 'set' | 'get';
  obj: any;
  property: string;
  newValue?: any;
}) => any;

const defaultTransformer: Transformer = ({ type, obj, property, newValue }) => {
  if (type === 'get') {
    return obj[property];
  }

  return (obj[property] = newValue);
};

/**
 * Allow to cancat object and proxies together without loosing get and set proxy call
 * @param objs
 * @param transformer Apply an action when set or get is called
 * @returns
 *
 * @author yoannchb-pro
 */
export function concatProxiesAndObjs<T extends Record<string, any>[]>(
  objs: T,
  transformer: Transformer = defaultTransformer
): UnionToIntersection<T[number]> {
  // We create a fake object with undefined values but all the keys
  // Because when we use a proxy in with() {} the key need to exist
  // Otherwise it will throw an error
  let fakeObj: Record<string, undefined> = {};
  for (const obj of objs) {
    fakeObj = { ...fakeObj, ...Object.keys(obj).reduce((a, b) => ({ ...a, [b]: undefined }), {}) };
  }

  const proxyHandler: ProxyHandler<any> = {
    get(target, property, receiver) {
      if (typeof property === 'symbol') return Reflect.get(target, property, receiver);

      for (const obj of objs) {
        if (property in obj) {
          return transformer({ type: 'get', obj, property });
        }
      }

      return Reflect.get(target, property, receiver);
    },
    set(target, property, newValue, receiver) {
      if (typeof property === 'symbol') return Reflect.set(target, property, newValue, receiver);

      for (const obj of objs) {
        if (property in obj) {
          return transformer({ type: 'set', obj, property, newValue });
        }
      }

      return Reflect.set(target, property, newValue, receiver);
    }
  };

  return new Proxy(fakeObj, proxyHandler);
}
