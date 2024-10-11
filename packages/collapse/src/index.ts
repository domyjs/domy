import type DOMY from '@domyjs/core/src';
import type { DomyDirectiveHelper, DomyDirectiveReturn } from '@domyjs/core/src/types/Domy';

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
export function collapsePlugin(domy: DomyDirectiveHelper): DomyDirectiveReturn {
  const el = domy.el as HTMLElement;

  // We get the settings first to ensure it will not throw an error in the following deep render
  const settingsAttr = el.getAttribute(SETTINGS_ATTRIBUTE);
  const settings: CollapseSettings = settingsAttr
    ? domy.evaluateWithoutListening(settingsAttr)
    : {};

  el.removeAttribute(SETTINGS_ATTRIBUTE);

  // We deep render the element first to get his initial height
  domy.deepRender({
    element: el,
    scopedNodeData: domy.scopedNodeData
  });

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
}

document.addEventListener('domy:ready', event => {
  const { detail: DOMYOBJ } = event as CustomEvent<typeof DOMY>;
  DOMYOBJ.plugin(domyPluginSetter => {
    domyPluginSetter.directive('collapse', collapsePlugin);
    domyPluginSetter.directive('collapse-settings', () => {
      throw new Error(`The directive "collapse-settings" as to be use with "collapse" directive.`);
    });

    domyPluginSetter.prioritise(['collapse', 'collapse-settings']);
  });
});
