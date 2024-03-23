import { render } from '@core/render';
import { Dependencie, Signal } from '@core/Signal';
import { VirtualDom, VirtualElement, VirtualText } from '@core/VitualDom';
import { App } from '@typing/App';
import { State } from '@typing/State';
import { getContext } from '@utils/getContext';

const $state: State = {
  isInitialised: false,

  $state: [],
  $fn: {},
  $events: {},
  $refs: {}
};

async function initDomy(app: App) {
  const allElements = document.querySelectorAll('*');
  const rootElements = Array.from(allElements).filter(el => !el.parentElement);

  const initialDom = new VirtualDom(rootElements);

  function callback(
    virtualParent: VirtualElement | null,
    virtualElement: VirtualElement | VirtualText
  ) {
    try {
      render($state, virtualParent, virtualElement);
    } catch (err) {
      console.error(err);
    }
  }

  initialDom.visit(callback);

  // Mounted
  if (app.$mounted) {
    try {
      await app.$mounted.call(getContext(undefined, $state));
    } catch (err) {
      console.error(err);
    }
  }
}

async function DOMY(app: App) {
  if ($state.isInitialised) throw new Error('DOMY as already be initialised');

  // States
  for (const key in app.$state) {
    $state.$state.push(new Signal(key, app.$state[key]));
  }

  // Functions
  for (const key in app.$fn) {
    $state.$fn[key] = app.$fn[key];
  }

  // Watchers
  for (const watcherName in app.$watch) {
    const signal = $state.$state.find(s => s.name === watcherName);
    if (!signal) {
      console.error(`Invalide watcher name "${watcherName}"`);
      continue;
    }

    signal.attach({
      $el: null,
      fn: async () => {
        // We remove the watcher too don't trigger it an other time if the user change the value
        const watcher = signal.dependencies.shift() as Dependencie;
        try {
          await app.$watch![watcherName].call(getContext(undefined, $state));
        } catch (err) {
          console.error(err);
        }
        signal.dependencies.unshift(watcher);
      }
    });
  }

  // Init
  if (app.$setup) {
    try {
      await app.$setup.call(getContext(undefined, $state));
    } catch (err) {
      console.error(err);
    }
  }

  $state.isInitialised = true;
  document.addEventListener('DOMContentLoaded', () => initDomy(app));

  // We display a message if a key doesn't exist
  const properties = ['$state', '$fn', '$setup', '$mounted', '$watch'] as (keyof App)[];
  const unknowKeys = Object.keys(app).filter(key => !properties.includes(key as any));
  if (unknowKeys.length > 0) console.error(`Unknown properties "${unknowKeys.join(', ')}"`);
}

export default DOMY;
