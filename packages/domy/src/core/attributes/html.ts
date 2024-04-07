import { Domy, DomyProps } from '../../types/Domy';

function htmlImplementation(domy: DomyProps) {
  domy.effect(() => {
    domy.el.innerHTML = domy.utils.evaluate({ code: domy.attr.value, context: null });
  });
}

export function htmlAttribute(domy: Domy) {
  domy.registerAttribute('html', htmlImplementation);
}
