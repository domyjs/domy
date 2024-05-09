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
import { error, warn } from '../utils/logs';
import { dElseImplementation } from '../directives/d-else';
import { binding } from './binding';
import { events } from './events';

type Plugins = {
  sortedDirectives: string[];
  prefixes: Record<string, DomyDirectiveFn>;
  directives: Record<string, DomyDirectiveFn>;
  helpers: Record<string, DomySpecialFn>;
};

export const PLUGINS: Plugins = {
  sortedDirectives: ['ignore', 'once', 'cloak', 'transition', 'ref', 'if', 'else-if', 'else'],
  prefixes: {
    bind: binding,
    on: events
  },
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
      if (PLUGINS.sortedDirectives.includes(directive)) {
        warn(`The directive "${directive}" is already prioritise.`);
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
  try {
    pluginMaker(pluginDefinition);
  } catch (err: any) {
    error(err);
  }
}
