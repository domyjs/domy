import { DomySpecialHelper } from '../types/Domy';

/**
 * Give the passed props for a component only
 * Example:
 * const Count = DOMY.createComponent(...)
 * <Count :count="5"></Count>
 * Inside Count
 * console.log($props.count) // 5
 * @param domy
 * @returns
 *
 * @author yoannchb-pro
 */
export function $props(domy: DomySpecialHelper) {
  return domy.state.componentInfos?.componentData.$props;
}
