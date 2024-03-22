import { renderElement } from '@core/renderElement';
import { VirtualDom, VirtualElement } from '@core/VitualDom';
import { Signal, StateObj } from '@core/Signal';
import { State } from '@typing/State';
import { getDatas } from '@utils/getDatas';

const $state: State = {
  $state: [], // State of the current scope
  $events: {},

  $globalState: {},
  $store: {},
  $refs: {}
};

const DOMY = {
  data(name: string, state: StateObj) {
    if ($state.$globalState[name]) throw new Error(`A state with the name "${name}" already exist`);

    $state.$globalState[name] = state;
  },
  store(state: StateObj) {
    if (Object.keys($state.$store).length > 0)
      throw new Error('You can only create one store by page');

    for (const key in state) {
      $state.$store[key] = new Signal(key, state[key]);
    }
  }
};

/**
 * Init the virtual dom and Domy
 */
function initDomy() {
  const initialDom = new VirtualDom(document.querySelector('*') as Element);
  function callback(virtualParent: VirtualElement | null, virtualElement: VirtualElement | string) {
    if (typeof virtualElement === 'string') return;

    try {
      const haveDatas = typeof virtualElement.domiesAttributes['d-data'] === 'string';
      renderElement($state, virtualParent, virtualElement);

      if (haveDatas) {
        const datas = getDatas({
          $state,
          virtualElement,
          virtualParent,
          notifier: () => renderElement($state, virtualParent, virtualElement)
        });

        $state.$state.push(...datas);

        for (const child of virtualElement.childs) {
          initialDom.visitFrom(child, callback);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }
  initialDom.visit(callback);
}

(window as any).DOMY = DOMY;
document.addEventListener('DOMContentLoaded', initDomy);
