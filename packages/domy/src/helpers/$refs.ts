import { DomySpecialHelper } from '@domyjs/types/src/Domy';

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
export function $refs(domy: DomySpecialHelper) {
  return domy.state.refs;
}
