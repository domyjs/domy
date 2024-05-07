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
import { $dispatch } from '../helpers/$dispatch';
import { $el } from '../helpers/$el';
import { $nextTick } from '../helpers/$nextTick';
import { $refs } from '../helpers/$refs';
import { $root } from '../helpers/$root';
import { DomyDirectiveFn, DomyPlugin, DomyPluginDefinition, DomySpecialFn } from '../types/Domy';
import { error } from '../utils/logs';
import { dElseImplementation } from '../directives/d-else';

type Plugins = {
  sortedDirectives: string[];
  directives: Record<string, DomyDirectiveFn>;
  helpers: Record<string, DomySpecialFn>;
};

export const PLUGINS: Plugins = {
  sortedDirectives: ['ignore', 'once', 'cloak', 'transition', 'ref', 'if', 'else-if', 'else'],
  directives: {
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
    cloak: dCloakImplementation
  },
  helpers: {
    el: $el,
    refs: $refs,
    root: $root,
    dispatch: $dispatch,
    nextTick: $nextTick
  }
};

const pluginDefintiion: DomyPluginDefinition = {
  registerDirective(name, fn) {
    if (name in PLUGINS.directives) {
      throw new Error(`A directive with the name "${name}" already exist.`);
    }
    PLUGINS.directives[name] = fn;
  },
  registerHelper(name, fn) {
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
export function registerPlugin(plugin: DomyPlugin) {
  try {
    plugin(pluginDefintiion);
  } catch (err: any) {
    error(err);
  }
}
