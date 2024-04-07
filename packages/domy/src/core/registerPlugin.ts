import { dForImplementation } from '../attributes/for';
import { dHtmlImplementation } from '../attributes/html';
import { dIfImplementation } from '../attributes/if';
import { dModelImplementation } from '../attributes/model';
import { dTextImplementation } from '../attributes/text';
import { DomyPlugin } from '../types/Domy';

export const DIRECTIVES = {
  attributes: [
    dIfImplementation,
    dForImplementation,
    dHtmlImplementation,
    dTextImplementation,
    dModelImplementation
  ]
};

export function registerPlugin(plugin: DomyPlugin) {}
