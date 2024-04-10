import { dForImplementation } from '../attributes/d-for';
import { dHtmlImplementation } from '../attributes/d-html';
import { dIfImplementation } from '../attributes/d-if';
import { dModelImplementation } from '../attributes/d-model';
import { dTextImplementation } from '../attributes/d-text';
import { DomyPlugin } from '../types/Domy';

export const DIRECTIVES = {
  attributes: {
    if: dIfImplementation,
    for: dForImplementation,
    html: dHtmlImplementation,
    text: dTextImplementation,
    model: dModelImplementation
  }
};

export function registerPlugin(plugin: DomyPlugin) {}
