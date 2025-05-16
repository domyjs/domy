import type {
  DomyDirectiveHelper,
  DomyDirectiveReturn,
  DomyPlugin
} from '@domyjs/core/src/types/Domy';

type CollapseSettings = {
  height?: number;
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
      `The "d-collapse" directive as to be placed after "d-collapse-settings" directive (and not before).`
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

  // We wait the element to be mounted first to get his initial height
  domy.onElementMounted(() => {
    const initialHeight = settings.height ?? el.getBoundingClientRect().height;

    let isInitialised = false;
    el.style.overflowY = 'hidden';

    domy.effect(() => {
      const isShow = domy.evaluate(domy.attr.value);

      if (isInitialised) el.style.transition = settings.transition ?? 'height 250ms ease-out';

      if (isShow) {
        el.style.height = `${initialHeight}px`;
      } else {
        el.style.height = `${settings.defaultHeight ?? 0}px`;
      }

      isInitialised = true;
    });
  });
}

const collapsePluginDefinition: DomyPlugin = domyPluginSetter => {
  domyPluginSetter.directive('collapse', collapsePlugin);
  domyPluginSetter.directive('collapse-settings', collapseSettingsPlugin);
};

export default collapsePluginDefinition;
