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
 * Position an element to the right anchor
 * @param target
 * @param anchor
 * @param position
 *
 * @author yoannchb-pro
 */
function positionElement(target: HTMLElement, anchor: HTMLElement, position: POSITION) {
  const anchorRect = anchor.getBoundingClientRect();

  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

  let top = 0;
  let left = 0;
  let transform = '';

  switch (position) {
    case POSITION.BOTTOM:
      top = anchorRect.bottom + scrollTop;
      left = anchorRect.left + scrollLeft + anchorRect.width / 2;
      transform = 'translateX(-50%)';
      break;
    case POSITION.BOTTOM_START:
      top = anchorRect.bottom + scrollTop;
      left = anchorRect.left + scrollLeft;
      transform = '';
      break;
    case POSITION.BOTTOM_END:
      top = anchorRect.bottom + scrollTop;
      left = anchorRect.right + scrollLeft;
      transform = 'translateX(-100%)';
      break;

    case POSITION.TOP:
      top = anchorRect.top + scrollTop;
      left = anchorRect.left + scrollLeft + anchorRect.width / 2;
      transform = 'translate(-50%, -100%)';
      break;
    case POSITION.TOP_START:
      top = anchorRect.top + scrollTop;
      left = anchorRect.left + scrollLeft;
      transform = 'translateY(-100%)';
      break;
    case POSITION.TOP_END:
      top = anchorRect.top + scrollTop;
      left = anchorRect.right + scrollLeft;
      transform = 'translate(-100%, -100%)';
      break;

    case POSITION.LEFT:
      top = anchorRect.top + scrollTop + anchorRect.height / 2;
      left = anchorRect.left + scrollLeft;
      transform = 'translate(-100%, -50%)';
      break;
    case POSITION.LEFT_START:
      top = anchorRect.top + scrollTop;
      left = anchorRect.left + scrollLeft;
      transform = 'translateX(-100%)';
      break;
    case POSITION.LEFT_END:
      top = anchorRect.bottom + scrollTop;
      left = anchorRect.left + scrollLeft;
      transform = 'translate(-100%, -100%)';
      break;

    case POSITION.RIGHT:
      top = anchorRect.top + scrollTop + anchorRect.height / 2;
      left = anchorRect.right + scrollLeft;
      transform = 'translateY(-50%)';
      break;
    case POSITION.RIGHT_START:
      top = anchorRect.top + scrollTop;
      left = anchorRect.right + scrollLeft;
      transform = '';
      break;
    case POSITION.RIGHT_END:
      top = anchorRect.bottom + scrollTop;
      left = anchorRect.right + scrollLeft;
      transform = 'translateY(-100%)';
      break;
  }

  target.style.position = 'absolute';
  target.style.top = `${top}px`;
  target.style.left = `${left}px`;
  target.style.transform = transform;
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
  // Ensure we can access refs
  domy.onAppMounted(() => {
    const anchorEl = domy.evaluate(domy.attr.value);
    if (!(anchorEl instanceof HTMLElement)) {
      throw new Error(
        `(Anchor) Invalid anchor element. You must provide a DOM element or a ref to one.`
      );
    }

    const target = domy.block.el as HTMLElement;
    const position = (domy.modifiers[0] as POSITION) || POSITION.BOTTOM;

    target.style.display = 'none';

    const showTarget = () => {
      positionElement(target, anchorEl, position);
      target.style.display = 'block';
    };
    const hideTarget = () => (target.style.display = 'none');

    const onAnchorClick = (e: MouseEvent) => {
      e.stopPropagation();
      if (target.style.display === 'none') showTarget();
      else hideTarget();
    };
    const onDocumentClick = () => hideTarget();

    anchorEl.addEventListener('click', onAnchorClick);
    document.addEventListener('click', onDocumentClick);

    const updatePosition = () => {
      if (target.style.display !== 'none') positionElement(target, anchorEl, position);
    };

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    domy.cleanup(() => {
      anchorEl.removeEventListener('click', onAnchorClick);
      document.removeEventListener('click', onDocumentClick);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    });
  });
}

const anchorPluginDefinition: DomyPlugin = domyPluginSetter => {
  domyPluginSetter.directive('anchor', anchorPlugin);
};

export default anchorPluginDefinition;
