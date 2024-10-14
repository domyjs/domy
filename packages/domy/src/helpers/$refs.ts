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
  const refs: Refs = {};
  for (const [name, block] of Object.entries(domy.state.refs)) {
    refs[name] = block.el;
  }
  return refs;
}
