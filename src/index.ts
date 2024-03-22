import { renderElement } from '@core/renderElement';
import { DOMY } from '@core/DOMY';
import { VirtualDom } from '@core/VitualDom';

function initDomy() {
  const initialDom = new VirtualDom(document.documentElement);
  initialDom.visit((virtualParent, virtualElement) => renderElement(virtualParent, virtualElement));
}

(window as any).DOMY = DOMY;
document.addEventListener('DOMContentLoaded', initDomy);
