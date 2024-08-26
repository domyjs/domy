import { PLUGINS } from '../core/plugin';
import { DomySpecialHelper } from '../types/Domy';
import { State } from '../types/State';

/**
 * Return the initialised helpers
 * @param el
 * @param state
 * @param scopedNodeData
 * @returns
 */
export function getHelpers(
  el: Element | Text | undefined,
  state: State,
  scopedNodeData: Record<string, any>[] = []
) {
  const helpers: Record<string, (domy: DomySpecialHelper) => any> = {};
  for (const [name, fn] of Object.entries(PLUGINS.helpers)) {
    helpers['$' + name] = fn({
      el,
      state,
      scopedNodeData
    });
  }
  return helpers;
}
