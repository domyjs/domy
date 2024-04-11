import { DomySpecialHelper } from '../types/Domy';

export function $root(domy: DomySpecialHelper) {
  return domy.el?.parentNode;
}
