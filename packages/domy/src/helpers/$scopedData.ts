import { DomySpecialHelper } from '../types/Domy';
import { getReactiveHandler } from '../utils/getReactiveHandler';

/**
 * Give the scopedData
 * @param domy
 * @returns
 *
 * @author yoannchb-pro
 */
export function $scopedData(domy: DomySpecialHelper) {
  const scopedData: Record<string, any> = {};

  for (const obj of domy.scopedNodeData) {
    for (const key in obj) {
      Object.defineProperty(scopedData, key, getReactiveHandler(obj, key));
    }
  }

  return scopedData;
}
