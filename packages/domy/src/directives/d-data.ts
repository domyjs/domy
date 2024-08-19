import { DomyDirectiveHelper, DomyDirectiveReturn } from '../types/Domy';

/**
 * d-data implementation
 * It create a reactive variable only accessible in the scoped node element
 * @param domy
 *
 * @author yoannchb-pro
 */
export function dDataImplementation(domy: DomyDirectiveHelper): DomyDirectiveReturn {
  const data = domy.evaluate(domy.attr.value);

  domy.addScopeToNode(domy.reactive(data));
}
