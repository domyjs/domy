import { DomySpecialHelper } from '../types/Domy';

/**
 * Give the components attributes
 * Example:
 * const ErrorMessage = DOMY.createComponent(...)
 * <Error-Message class="red" :count="5">
 *  <p>Hello</p>
 * </Error-Message>
 * Inside Error-Message
 * console.log($attrs) // { class: "red" }
 * @param domy
 * @returns
 *
 * @author yoannchb-pro
 */
export function $attrs(domy: DomySpecialHelper) {
  return domy.state.componentInfos?.componentData.$attrs;
}
