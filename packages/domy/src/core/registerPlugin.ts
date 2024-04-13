import { dCloakImplementation } from '../directives/d-cloak';
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
import { $dispatch } from '../specials/$dispatch';
import { $el } from '../specials/$el';
import { $nextTick } from '../specials/$nextTick';
import { $refs } from '../specials/$refs';
import { $root } from '../specials/$root';
import { DomyPlugin } from '../types/Domy';

export const PLUGINS = {
  sortedDirectives: ['ignore', 'once', 'cloak', 'transition', 'ref', 'if'],
  directives: {
    if: dIfImplementation,
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
  specials: {
    el: $el,
    refs: $refs,
    root: $root,
    dispatch: $dispatch,
    nextTick: $nextTick
  }
};

export function registerPlugin(plugin: DomyPlugin) {}
