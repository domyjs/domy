import { DomySpecialHelper } from '../types/Domy';
import { getReactiveHandler } from '../utils/getReactiveHandler';

/**
 * Give the reactive data
 * @param domy
 * @returns
 *
 * @author yoannchb-pro
 */
export function $data(domy: DomySpecialHelper) {
  const data: Record<string, any> = {};

  for (const key in domy.state.data) {
    Object.defineProperty(data, key, getReactiveHandler(domy.state.data, key));
  }

  return data;
}
