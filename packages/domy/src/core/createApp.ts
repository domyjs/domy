import { App, Data } from '../types/App';
import { Components, ComponentProps } from '../types/Component';
import { Config } from '../types/Config';
import { toKebabCase } from '../utils/toKebabCase';
import { getRender } from './getRender';
import { initApp } from './initApp';

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
  P extends ComponentProps['props']
>(appDefinition?: App<D, M, A, P>, props?: ComponentProps, byPassAttributes?: string[]) {
  ++appId;

  let config: Config = {};
  let componentsList: Components = {};

  function components(c: Components) {
    const kebabCaseComponents: Components = {};

    for (const key in c) {
      const kebabKey = toKebabCase(key);
      kebabCaseComponents[kebabKey] = c[key];
    }

    componentsList = kebabCaseComponents;

    return { configure, mount };
  }

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
          props,
          byPassAttributes
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
    return { mount, components };
  }

  return {
    appId,
    mount,
    configure,
    components
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
