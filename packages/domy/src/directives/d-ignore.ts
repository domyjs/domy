import { DomyDirectiveReturn } from '../types/Domy';

/**
 * d-ignore implementation
 * Allow to skip the rendering of an element even if it have domies attributes
 * @param domy
 *
 * @author yoannchb-pro
 */
export function dIgnoreImplementation(): DomyDirectiveReturn {
  return {
    skipChildsRendering: true,
    skipOtherAttributesRendering: true,
    skipComponentRendering: true
  };
}
