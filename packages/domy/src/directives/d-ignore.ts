import { DomyDirectiveReturn } from '../types/Domy';

/**
 * d-ignore implementation
 * @param domy
 *
 * @author yoannchb-pro
 */
export function dIgnoreImplementation(): DomyDirectiveReturn {
  return { skipChildsRendering: true, skipOtherAttributesRendering: true };
}
