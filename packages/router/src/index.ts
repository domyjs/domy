import type { DomyPluginDefinition } from '@domyjs/domy';
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
    beforeEach: router.beforeEach.bind(router),
    afterEach: router.afterEach.bind(router),

    RouterView: router.createRouterView(),
    RouterLink: router.createRouterLink(),

    useRouter: router.getHelper.bind(router),

    router(domyPluginSetter: DomyPluginDefinition): void {
      domyPluginSetter.helper('router', () => router.getHelper());
    }
  };
}

export default createRouter;
