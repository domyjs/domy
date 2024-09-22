import { DomySpecialHelper } from '../types/Domy';
import { getReactiveHandler } from '../utils/getReactiveHandler';

/**
 * Give the data and scopedData
 * @param domy
 * @returns
 *
 * @author yoannchb-pro
 */
export function $allData(domy: DomySpecialHelper) {
  const allData: Record<string, any> = {};

  for (const key in domy.state.data) {
    Object.defineProperty(allData, key, getReactiveHandler(domy.state.data, key));
  }

  for (const obj of domy.scopedNodeData) {
    for (const key in obj) {
      Object.defineProperty(allData, key, getReactiveHandler(obj, key));
    }
  }

  return allData;
}
