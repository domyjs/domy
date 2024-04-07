import { Domy, DomyProps } from '../../types/Domy';

function textImplementation(domy: DomyProps) {
  domy.effect(() => {
    domy.el.textContent = domy.utils.evaluate({ code: domy.attr.value, context: null });
  });
}

export function textAttribute(domy: Domy) {
  domy.registerAttribute('text', textImplementation);
}
