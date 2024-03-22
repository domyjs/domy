import { DOMY, renderElement } from '@core/core';
import { VirtualDom } from '@core/VitualDom';

function initDomy() {
  const virtualDom = new VirtualDom(document.documentElement);

  virtualDom.visit(virtualElement => {
    renderElement(virtualElement);
  });
}

(window as any).DOMY = DOMY;
document.addEventListener('DOMContentLoaded', initDomy);
