import type DOMY from '@domyjs/core/src';
import type { DomyDirectiveHelper } from '@domyjs/core/src/types/Domy';

enum POSITION {
  BOTTOM = 'b',
  BOTTOM_START = 'bs',
  BOTTOM_END = 'be',

  TOP = 't',
  TOP_START = 'ts',
  TOP_END = 'te',

  LEFT = 'l',
  LEFT_START = 'ls',
  LEFT_END = 'le',

  RIGHT = 'r',
  RIGHT_START = 'rs',
  RIGHT_END = 're'
}

/**
 * Anchor directive
 * Allow us to attach an element to an other
 * Usefull to create tooltip for example
 * @param domy
 * @returns
 *
 * @author yoannchb-pro
 */
export function anchorPlugin(domy: DomyDirectiveHelper) {
  const anchorEl = domy.evaluateWithoutListening(domy.attr.value);

  console.log(POSITION);

  if (!anchorEl) {
    throw new Error(
      `(Anchor) Invalide anchor element. You have to give a ref or a html element for the anchor directive.`
    );
  }

  // TODO
}

document.addEventListener('domy:ready', event => {
  const { detail: DOMYOBJ } = event as CustomEvent<typeof DOMY>;
  DOMYOBJ.plugin(domyPluginSetter => {
    domyPluginSetter.directive('anchor', anchorPlugin);
  });
});
