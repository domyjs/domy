import { DomySpecialHelper } from '../types/Domy';

/**
 * Give the passed childrens for a component only
 * Example:
 * const ErrorMessage = DOMY.createComponent(...)
 * <Error-Message :count="5">
 *  <p>Hello</p>
 * </Error-Message>
 * Inside Error-Message
 * console.log($childrens) // [p]
 * @param domy
 * @returns
 *
 * @author yoannchb-pro
 */
export function $childrens(domy: DomySpecialHelper) {
  return domy.state.componentInfos?.childrens;
}
