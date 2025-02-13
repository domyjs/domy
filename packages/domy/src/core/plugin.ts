import { dCloakImplementation } from '../directives/d-cloak';
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
import { error, warn } from '../utils/logs';
import { dElseImplementation } from '../directives/d-else';
import { binding } from './binding';
import { events } from './events';
import { dScopeImplementation } from '../directives/d-scope';
import { DomyDirectiveFn, DomyPlugin, DomyPluginDefinition, DomySpecialFn } from '../types/Domy';
import { dSetupImplementation } from '../directives/d-setup';
import { dWatchImplementation } from '../directives/d-watch';
import { $childrens } from '../helpers/$childrens';
import { $props } from '../helpers/$props';
import { dTeleportImplementation } from '../directives/d-teleport';
import { $config } from '../helpers/$config';
import { $data } from '../helpers/$data';
import { $scopedData } from '../helpers/$scopedData';
import { $allData } from '../helpers/$allData';
import { $methods } from '../helpers/$methods';
import { dMountedImplementation } from '../directives/d-mounted';
import { dUnMountImplementation } from '../directives/d-unmount';
import { dAttrsImplementation } from '../directives/d-attrs';
import { dKeyImplementation } from '../directives/d-key';
import { $watch } from '../helpers/$watch';
import { dComponentImplementation } from '../directives/d-component';
import { $attrs } from '../helpers/$attrs';
import { dInsertImplementation } from '../directives/d-insert';
import { dNameImplementation } from '../directives/d-name';
import { $names } from '../helpers/$names';
import { callWithErrorHandling } from '../utils/callWithErrorHandling';
import { $effect } from '../helpers/$effect';
import { dEffectImplementation } from '../directives/d-effect';

type Plugins = {
  sortedDirectives: string[];
  prefixes: Record<string, DomyDirectiveFn>;
  directives: Record<string, DomyDirectiveFn>;
  helpers: Record<string, DomySpecialFn>;
};

export const PLUGINS: Plugins = {
  sortedDirectives: [
    'ignore',
    'once',

    'scope',
    'key',
    'transition',

    'if',
    'else-if',
    'else',

    'component'
  ],
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
    watch: dWatchImplementation,
    effect: dEffectImplementation,
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
    cloak: dCloakImplementation,
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
    data: $data,
    scopedData: $scopedData,
    allData: $allData,
    methods: $methods,
    watch: $watch,
    attrs: $attrs,
    names: $names,
    effect: $effect
  }
};

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
  },
  prioritise(directives) {
    for (const directive of directives) {
      // Check the directive exist
      if (!(directive in PLUGINS.directives)) {
        error(
          new Error(
            `The directive "${directive}" can't be prioritise because it doesn't exist. Ensure to register it with domy.directive() first.`
          )
        );
        continue;
      }

      // Check the directive is not already prioritised
      if (PLUGINS.sortedDirectives.includes(directive)) {
        warn(
          `The directive "${directive}" is already prioritised. The prioritisation has been skipped.`
        );
        continue;
      }

      PLUGINS.sortedDirectives.push(directive);
    }
  }
};

/**
 * Allow the user to register a custom directive or special
 * @param plugin
 *
 * @author yoannchb-pro
 */
export function plugin(pluginMaker: DomyPlugin) {
  callWithErrorHandling(
    () => pluginMaker(pluginDefinition),
    err => error(err)
  );
}
