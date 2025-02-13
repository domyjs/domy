import { App, Data } from '../types/App';
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
export function createAdvancedApp<
  D extends Data,
  M extends string,
  A extends any[],
  P extends ComponentInfos['componentData']['$props'] = Record<string, never>
>(appDefinition?: App<D, M, A, P>, componentInfos?: ComponentInfos, byPassAttributes?: string[]) {
  ++appId;

  const pluginHelper = componentInfos?.parentPluginHelper ?? createPluginRegistrer();

  let config: Config = {};
  let componentsList: Components = {};

  function mount(
    target?: HTMLElement
  ): Promise<{ render: ReturnType<typeof getRender>; unmount: () => void } | undefined> {
    return new Promise(resolve => {
      const build = async () => {
        const domTarget = target ?? document.body;

        const render = await initApp({
          appId,
          app: appDefinition,
          components: componentsList,
          config,
          target: domTarget,
          componentInfos,
          byPassAttributes,
          pluginHelper
        });

        resolve(render);
      };

      // We ensure the DOM is accessible before mounting the app
      if (document.readyState === 'interactive' || document.readyState === 'complete') {
        build();
      } else document.addEventListener('DOMContentLoaded', build);
    });
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
export function createApp<D extends Data, M extends string, A extends any[]>(
  appDefinition?: App<D, M, A>
) {
  return createAdvancedApp<D, M, A, Record<string, never>>(appDefinition);
}

// createApp({
//   data: {
//     f: 5
//   },
//   methods: {
//     r(t: string) {
//       this.r;
//     },
//     g() {
//       this.r();
//       this.r(5);
//     }
//   }
// });
