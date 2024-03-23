import { renderElement } from '@core/renderElement';
import { VirtualDom, VirtualElement } from '@core/VitualDom';
import { Signal, StateObj } from '@core/Signal';
import { State } from '@typing/State';
import { getDatas } from '@utils/getDatas';
import { copyState } from '@utils/copyState';

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
      const stateCopy = $state;
      const haveDatas = typeof virtualElement.domiesAttributes['d-data'] === 'string';
      renderElement(stateCopy, virtualParent, virtualElement, [], ['d-data']);

      if (haveDatas) {
        const datas = getDatas({
          $state: stateCopy,
          virtualElement,
          virtualParent,
          notifier: () => renderElement(stateCopy, virtualParent, virtualElement, [], ['d-data'])
        });

        $state.$state.unshift(...datas);

        for (const child of virtualElement.childs) {
          initialDom.visitFrom(child, callback);
        }

        // $state.$state.splice(0, datas.length);
      }
    } catch (err) {
      console.error(err);
    }
  }
  initialDom.visit(callback);
}

(window as any).DOMY = DOMY;
document.addEventListener('DOMContentLoaded', initDomy);
