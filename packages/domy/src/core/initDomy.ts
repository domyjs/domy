import { State } from '@typing/State';
import { getContext } from '@utils/getContext';
import { toRegularFn } from '@utils/toRegularFn';
import { render } from './render';
import { VirtualDom, VirtualElement, VirtualText } from './VitualDom';
import { App } from '@typing/App';

/**
 * Init domy when the dom and state are ready
 * @param app
 * @param target
 * @param $state
 */
export async function initDomy(app: App, target: Element, $state: State) {
  const initialDom = new VirtualDom([target]);

  // Rendering
  function callback(
    virtualParent: VirtualElement | null,
    virtualElement: VirtualElement | VirtualText
  ) {
    try {
      render({ $state, virtualParent, virtualElement });
    } catch (err) {
      console.error(err);
    }
  }

  initialDom.visit(callback);

  // Mounted
  if (app.$mounted) {
    try {
      const mountedFn = toRegularFn(app.$mounted);
      await mountedFn.call(getContext(undefined, $state));
    } catch (err) {
      console.error(err);
    }
  }
}
