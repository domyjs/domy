import { renderElement } from '@core/renderElement';
import { DOMY } from '@core/DOMY';
import { VirtualDom } from '@core/VitualDom';

/**
 * Init the virtual dom and Domy
 */
function initDomy() {
  const initialDom = new VirtualDom(document.querySelector('*') as Element);
  initialDom.visit((virtualParent, virtualElement) => {
    try {
      renderElement(virtualParent, virtualElement);
    } catch (err) {
      console.error(err);
    }
  });
}

(window as any).DOMY = DOMY;
document.addEventListener('DOMContentLoaded', initDomy);
