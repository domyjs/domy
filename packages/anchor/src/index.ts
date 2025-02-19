import type { DomyDirectiveHelper, DomyPlugin } from '@domyjs/core/src/types/Domy';

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
function anchorPlugin(domy: DomyDirectiveHelper) {
  const anchorEl = domy.evaluate(domy.attr.value);

  console.warn(POSITION);

  if (!anchorEl) {
    throw new Error(
      `(Anchor) Invalide anchor element. You have to give a ref or a html element for the anchor directive.`
    );
  }

  // TODO
}

const anchorPluginDefinition: DomyPlugin = domyPluginSetter => {
  domyPluginSetter.directive('anchor', anchorPlugin);
};

export default anchorPluginDefinition;
