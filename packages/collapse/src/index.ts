import type DOMY from '@domyjs/core/src';
import type { DomyDirectiveHelper } from '@domyjs/core/src/types/Domy';

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
export function collapsePlugin(domy: DomyDirectiveHelper) {
  const el = domy.el as HTMLElement;

  // We deep render the element first to get his initial height
  domy.deepRender({
    element: el,
    byPassAttributes: [domy.attr.name],
    scopedNodeData: domy.scopedNodeData
  });

  const settingsAttr = el.getAttribute(SETTINGS_ATTRIBUTE);
  const settings: CollapseSettings = settingsAttr
    ? domy.evaluateWithoutListening(settingsAttr)
    : {};
  el.removeAttribute(SETTINGS_ATTRIBUTE);

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
  });
});
