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

const SETTINGS_ATTRIBUTE = 'd-collapse-settings';

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

  // We get the settings first to ensure it will not throw an error in the following deep render
  const settingsAttr = el.getAttribute(SETTINGS_ATTRIBUTE);
  const settings: CollapseSettings = settingsAttr ? domy.evaluate(settingsAttr) : {};

  el.removeAttribute(SETTINGS_ATTRIBUTE);

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
};

export default collapsePluginDefinition;
