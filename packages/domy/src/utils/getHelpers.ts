import * as ReactiveUtils from '@domyjs/reactive';
import { DomySpecialHelper } from '../types/Domy';
import { Helpers } from '../types/Helpers';
import { State } from '../types/State';
import { helpersUtils } from './helpersUtils';
import { Config } from '../types/Config';
import { PluginHelper } from '../core/plugin';

type Props = {
  domyHelperId?: number;
  el?: Element | Text;
  state: State;
  config: Config;
  scopedNodeData: Record<string, any>[];
  pluginHelper: PluginHelper;
};

/**
 * Return the initialised helpers with everything it need
 * @param el
 * @param state
 * @param scopedNodeData
 * @returns
 *
 * @author yoannchb-pro
 */
export function getHelpers(props: Props): Helpers {
  const helpers: Record<string, (domy: DomySpecialHelper) => any> = {};
  for (const [name, fn] of Object.entries(props.pluginHelper.PLUGINS.helpers)) {
    helpers['$' + name] = fn({
      ...props,
      ...ReactiveUtils,
      utils: helpersUtils
    });
  }
  return helpers;
}
