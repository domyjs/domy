import type { DomyPluginDefinition } from '@domyjs/core/src/types/Domy';
import { Router, Settings } from './Router';

/**
 * Router plugin
 * @param options
 * @returns
 *
 * @author yoannchb-pro
 */
function createRouter(options: Settings) {
  const router = new Router(options);

  return {
    RouterView: router.createRouterView(),
    RouterLink: router.createRouterLink(),

    useRouter: router.getHelper.bind(router),

    router(domyPluginSetter: DomyPluginDefinition): void {
      domyPluginSetter.helper('router', () => router.getHelper());
    }
  };
}

export default createRouter;
