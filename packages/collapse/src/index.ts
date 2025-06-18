import type { DomyDirectiveHelper, DomyDirectiveReturn, DomyPlugin } from '@domyjs/domy';

type CollapseSettings = {
  defaultHeight?: number;
  transition?: string;
};

class CollapsePlugin {
  constructor(private defaultSettings: CollapseSettings = {}) {}

  /**
   * Register collapse settings on the block
   * @param domy
   *
   * @author yoannchb-pro
   */
  collapseSettingsPlugin(domy: DomyDirectiveHelper): DomyDirectiveReturn {
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
  collapsePlugin(domy: DomyDirectiveHelper): DomyDirectiveReturn {
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
        const defaultHeight = settings.defaultHeight ?? this.defaultSettings.defaultHeight ?? 0;
        el.style.height = shouldBeShow ? `${defaultHeight}px` : `${height}px`;

        requestAnimationFrame(() => {
          if (isInitialised)
            el.style.transition =
              settings.transition ?? this.defaultSettings.transition ?? 'height 250ms ease-out';

          if (shouldBeShow) {
            el.style.height = `${height}px`;
            el.addEventListener('transitionend', heightAutoEvent);
          } else {
            el.style.height = `${defaultHeight}px`;
          }

          isInitialised = true;
        });
      });
    });
  }
}

const collapsePluginDefinition = (settings?: CollapseSettings) => {
  const collapseInstance = new CollapsePlugin(settings);
  const pluginSetter: DomyPlugin = domyPluginSetter => {
    domyPluginSetter.directive('collapse', collapseInstance.collapsePlugin.bind(collapseInstance));
    domyPluginSetter.directive(
      'collapse-settings',
      collapseInstance.collapseSettingsPlugin.bind(collapseInstance)
    );
  };
  return pluginSetter;
};

export default collapsePluginDefinition;
