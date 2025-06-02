import type {
  DomyDirectiveHelper,
  DomyDirectiveReturn,
  DomyPlugin
} from '@domyjs/core/src/types/Domy';

type CollapseSettings = {
  defaultHeight?: number;
  transition?: string;
};

/**
 * Register collapse settings on the block
 * @param domy
 *
 * @author yoannchb-pro
 */
function collapseSettingsPlugin(domy: DomyDirectiveHelper): DomyDirectiveReturn {
  if (!domy.block.el.getAttribute('d-collapse'))
    throw new Error(
      `(Collapse) The "d-collapse" directive as to be placed after "d-collapse-settings" directive (and not before).`
    );

  domy.block.setDataForPluginId('collapse-settings', domy.evaluate(domy.attr.value));
}

/**
 * Collapse directive
 * It will hide the element by setting the height to 0px
 * When it have to be show the height will go back to normal height with a transition
 * @param domy
 * @returns
 *
 * @author yoannchb-pro
 */
function collapsePlugin(domy: DomyDirectiveHelper): DomyDirectiveReturn {
  const el = domy.block.el as HTMLElement;
  const settings: CollapseSettings = domy.block.getDataForPluginId('collapse-settings') ?? {};
  const heightAutoEvent = () => (el.style.height = 'auto');

  // We wait the element to be mounted first to get his initial height
  domy.onElementMounted(() => {
    let isInitialised = false;
    el.style.overflowY = 'hidden';

    domy.effect(() => {
      el.removeEventListener('transitionend', heightAutoEvent);

      const shouldBeShow = domy.evaluate(domy.attr.value);

      el.style.transition = '';
      el.style.height = 'auto';
      const height = el.getBoundingClientRect().height;
      el.style.height = shouldBeShow ? `${settings.defaultHeight ?? 0}px` : `${height}px`;

      window.requestAnimationFrame(() => {
        if (isInitialised) el.style.transition = settings.transition ?? 'height 250ms ease-out';

        if (shouldBeShow) {
          el.style.height = `${height}px`;
          el.addEventListener('transitionend', heightAutoEvent);
        } else {
          el.style.height = `${settings.defaultHeight ?? 0}px`;
        }

        isInitialised = true;
      });
    });
  });
}

const collapsePluginDefinition: DomyPlugin = domyPluginSetter => {
  domyPluginSetter.directive('collapse', collapsePlugin);
  domyPluginSetter.directive('collapse-settings', collapseSettingsPlugin);
};

export default collapsePluginDefinition;
