import { Data, StructuredAPIApp } from '../types/App';
import { Config } from '../types/Config';
import { getRender } from './getRender';
import { hookAPI, HookAPIFnDefinition } from './hookAPI';
import { structuredAPI } from './structuredAPI';

/**
 * Initialise domy on a target (by default the body)
 * @param appDefinition
 * @param target
 *
 * @author yoannchb-pro
 */
export function createApp<D extends Data, M extends string, A extends any[]>(
  appDefinition?: StructuredAPIApp<D, M, A> | HookAPIFnDefinition
) {
  let config: Config = {};

  function mount(target?: HTMLElement): Promise<ReturnType<typeof getRender> | undefined> {
    return new Promise(resolve => {
      const build = async () => {
        const domTarget = target ?? document.body;

        let render;
        if (typeof appDefinition === 'function')
          render = await hookAPI(appDefinition, domTarget, config);
        else render = await structuredAPI(appDefinition, domTarget, config);

        resolve(render);
      };

      // We ensure the DOM is accessible before mounting the app
      if (document.readyState === 'interactive' || document.readyState === 'complete') {
        build();
      } else document.addEventListener('DOMContentLoaded', build);
    });
  }

  function configure(newConfig: Config) {
    config = newConfig;
    return { mount };
  }

  return {
    mount,
    configure
  };
}
