import { dElseIfImplementation } from '../directives/d-else-if';
import { dForImplementation } from '../directives/d-for';
import { dHtmlImplementation } from '../directives/d-html';
import { dIfImplementation } from '../directives/d-if';
import { dIgnoreImplementation } from '../directives/d-ignore';
import { dModelImplementation } from '../directives/d-model';
import { dOnceImplementation } from '../directives/d-once';
import { dRefImplementation } from '../directives/d-ref';
import { dShowImplementation } from '../directives/d-show';
import { dTextImplementation } from '../directives/d-text';
import { dTransitionImplementation } from '../directives/d-transition';
import { $el } from '../helpers/$el';
import { $nextTick } from '../helpers/$nextTick';
import { $refs } from '../helpers/$refs';
import { $root } from '../helpers/$root';
import { error } from '../utils/logs';
import { dElseImplementation } from '../directives/d-else';
import { binding } from './binding';
import { events } from './events';
import { dScopeImplementation } from '../directives/d-scope';
import { DomyDirectiveFn, DomyPlugin, DomyPluginDefinition, DomySpecialFn } from '../types/Domy';
import { dSetupImplementation } from '../directives/d-setup';
import { $childrens } from '../helpers/$childrens';
import { $props } from '../helpers/$props';
import { dTeleportImplementation } from '../directives/d-teleport';
import { $config } from '../helpers/$config';
import { dMountedImplementation } from '../directives/d-mounted';
import { dUnMountImplementation } from '../directives/d-unmount';
import { dAttrsImplementation } from '../directives/d-attrs';
import { dKeyImplementation } from '../directives/d-key';
import { dComponentImplementation } from '../directives/d-component';
import { $attrs } from '../helpers/$attrs';
import { dInsertImplementation } from '../directives/d-insert';
import { dNameImplementation } from '../directives/d-name';
import { $names } from '../helpers/$names';
import { callWithErrorHandling } from '../utils/callWithErrorHandling';

export type PluginHelper = ReturnType<typeof createPluginRegistrer>;
export type Plugins = {
  prefixes: Record<string, DomyDirectiveFn>;
  directives: Record<string, DomyDirectiveFn>;
  helpers: Record<string, DomySpecialFn>;
};

/**
 * Allow to make a copy of the default plugin so each app can add their own plugin
 * @returns
 *
 * @author yoannchb-pro
 */
function getDefaultsPlugin() {
  const DEFAULT_PLUGINS: Plugins = {
    prefixes: {
      bind: binding,
      on: events
    },
    directives: {
      key: dKeyImplementation,
      attrs: dAttrsImplementation,
      teleport: dTeleportImplementation,
      insert: dInsertImplementation,
      mounted: dMountedImplementation,
      unmount: dUnMountImplementation,
      setup: dSetupImplementation,
      scope: dScopeImplementation,
      if: dIfImplementation,
      'else-if': dElseIfImplementation,
      else: dElseImplementation,
      for: dForImplementation,
      html: dHtmlImplementation,
      text: dTextImplementation,
      model: dModelImplementation,
      ref: dRefImplementation,
      transition: dTransitionImplementation,
      ignore: dIgnoreImplementation,
      once: dOnceImplementation,
      show: dShowImplementation,
      component: dComponentImplementation,
      name: dNameImplementation
    },
    helpers: {
      el: $el,
      refs: $refs,
      root: $root,
      nextTick: $nextTick,
      childrens: $childrens,
      props: $props,
      config: $config,
      attrs: $attrs,
      names: $names
    }
  };
  return DEFAULT_PLUGINS;
}

/**
 * Allow to register plugin for the current instance
 * @returns
 *
 * @author yoannchb-pro
 */
export function createPluginRegistrer() {
  const PLUGINS: Plugins = getDefaultsPlugin();

  const pluginDefinition: DomyPluginDefinition = {
    prefix(name, fn) {
      if (name in PLUGINS.prefixes) {
        throw new Error(`A prefix with the name "${name}" already exist.`);
      }
      PLUGINS.prefixes[name] = fn;
    },
    directive(name, fn) {
      if (name in PLUGINS.directives) {
        throw new Error(`A directive with the name "${name}" already exist.`);
      }
      PLUGINS.directives[name] = fn;
    },
    helper(name, fn) {
      if (name in PLUGINS.helpers) {
        throw new Error(`A special with the name "${name}" already exist.`);
      }
      PLUGINS.helpers[name] = fn;
    }
  };

  /**
   * Allow the user to register a custom directive or special
   * @param plugin
   *
   * @author yoannchb-pro
   */
  function plugin(pluginMaker: DomyPlugin) {
    callWithErrorHandling(
      () => pluginMaker(pluginDefinition),
      err => error(err)
    );
  }

  return {
    PLUGINS,
    plugin
  };
}
