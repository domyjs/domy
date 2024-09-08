import { DomySpecialHelper } from '../types/Domy';

/**
 * Give the passed childrens for a component only
 * Example:
 * const ErrorMessage = DOMY.createComponent(...)
 * <ErrorMessage :count="5">
 *  <p>Hello</p>
 * </ErrorMessage>
 * Inside ErrorMessage
 * console.log($childrens) // [p]
 * @param domy
 * @returns
 *
 * @author yoannchb-pro
 */
export function $childrens(domy: DomySpecialHelper) {
  return domy.state.props?.childrens;
}
