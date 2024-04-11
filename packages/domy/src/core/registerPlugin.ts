import { dForImplementation } from '../directives/d-for';
import { dHtmlImplementation } from '../directives/d-html';
import { dIfImplementation } from '../directives/d-if';
import { dModelImplementation } from '../directives/d-model';
import { dTextImplementation } from '../directives/d-text';
import { $dispatch } from '../specials/$dispatch';
import { $el } from '../specials/$el';
import { $nextTick } from '../specials/$nextTick';
import { $refs } from '../specials/$refs';
import { $root } from '../specials/$root';
import { DomyPlugin } from '../types/Domy';

export const PLUGINS = {
  sortedDirectives: {
    if: dIfImplementation,
    for: dForImplementation,
    html: dHtmlImplementation,
    text: dTextImplementation,
    model: dModelImplementation
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
