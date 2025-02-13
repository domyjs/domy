import { DomySpecialHelper } from '../types/Domy';

/**
 * Give the registered child with a name to a component
 * Example:
 * const ErrorMessage = DOMY.createComponent(...)
 * <Error-Message :count="5">
 *  <p d-name='example'>Hello</p>
 * </Error-Message>
 * Inside Error-Message
 * console.log($names['example']) // [p]
 * @param domy
 * @returns
 *
 * @author yoannchb-pro
 */
export function $names(domy: DomySpecialHelper) {
  return domy.state.componentInfos?.names;
}
