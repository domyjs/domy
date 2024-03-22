import { DOMY, renderElement } from '@core/core';

function initDomy() {
  const allDomElements = document.querySelectorAll('*');

  for (const $el of allDomElements) {
    renderElement($el);
  }
}

(window as any).DOMY = DOMY;
document.addEventListener('DOMContentLoaded', initDomy);
