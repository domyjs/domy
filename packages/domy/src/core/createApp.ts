import { App } from '../types/App';
import { Components, ComponentInfos } from '../types/Component';
import { Config } from '../types/Config';
import { DomyPlugin } from '../types/Domy';
import { toKebabCase } from '../utils/toKebabCase';
import { getRender } from './getRender';
import { initApp } from './initApp';
import { createPluginRegistrer } from './plugin';

let appId = 0;

/**
 * Initialise domy on a target (by default the body)
 * @param appDefinition
 * @param target
 *
 * @author yoannchb-pro
 */
export function createAdvancedApp(
  appDefinition?: App,
  componentInfos?: ComponentInfos,
  byPassAttributes?: string[]
) {
  ++appId;

  const pluginHelper = componentInfos?.parentPluginHelper ?? createPluginRegistrer();

  let config: Config = {};
  let componentsList: Components = {};

  function mount(target?: HTMLElement): {
    render: ReturnType<typeof getRender>;
    unmount: () => void;
  } {
    const build = () => {
      const domTarget = target ?? document.body;

      return initApp({
        appId,
        app: appDefinition,
        components: componentsList,
        config,
        target: domTarget,
        componentInfos,
        byPassAttributes,
        pluginHelper
      });
    };

    // We ensure the DOM is accessible before mounting the app
    return build();
  }

  function configure(c: Config) {
    config = c;

    return { plugins, components, mount };
  }

  function plugins(pluginsList: DomyPlugin[]) {
    for (const plugin of pluginsList) {
      pluginHelper.plugin(plugin);
    }

    return { components, mount };
  }

  function components(c: Components) {
    const kebabCaseComponents: Components = {};

    for (const key in c) {
      const kebabKey = toKebabCase(key);
      kebabCaseComponents[kebabKey] = c[key];
    }

    componentsList = kebabCaseComponents;

    return { mount };
  }

  return {
    appId,
    mount,
    configure,
    components,
    plugins
  };
}

/**
 * Same as createAdvancedApp but the user can't inject data or methods
 * @param appDefinition
 * @returns
 *
 * @author yoannchb-pro
 */
export function createApp(appDefinition?: App) {
  return createAdvancedApp(appDefinition);
}
