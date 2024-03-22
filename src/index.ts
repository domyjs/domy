import { renderElement } from '@core/renderElement';
import { VirtualDom } from '@core/VitualDom';
import { Signal, StateObj } from '@core/Signal';
import { State } from '@typing/State';

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
  initialDom.visit((virtualParent, virtualElement) => {
    if (typeof virtualElement === 'string') return;

    try {
      renderElement($state, virtualParent, virtualElement);
    } catch (err) {
      console.error(err);
    }
  });
}

(window as any).DOMY = DOMY;
document.addEventListener('DOMContentLoaded', initDomy);
