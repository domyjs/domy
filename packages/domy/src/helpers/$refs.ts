import { DomySpecialHelper } from '../types/Domy';

type Refs = Record<string, Element>;

/**
 * Get a registered ref element
 * Example:
 * <p d-ref="text">Hello !</p>
 * $refs.text.textContent // Hello !
 * @param domy
 * @returns
 *
 * @author yoannchb-pro
 */
export function $refs(domy: DomySpecialHelper): Refs {
  return new Proxy({} as Refs, {
    get(target, p, receiver) {
      if (typeof p === 'symbol') return Reflect.get(target, p, receiver);
      return domy.state.refs[p].el;
    }
  });
}
