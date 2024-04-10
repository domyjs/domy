import { dForImplementation } from '../attributes/for';
import { dHtmlImplementation } from '../attributes/html';
import { dIfImplementation } from '../attributes/if';
import { dModelImplementation } from '../attributes/model';
import { dTextImplementation } from '../attributes/text';
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
