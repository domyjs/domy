import { render } from '@core/render';
import { Dependencie, Signal } from '@core/Signal';
import { VirtualDom, VirtualElement, VirtualText } from '@core/VitualDom';
import { App } from '@typing/App';
import { State } from '@typing/State';
import { getContext } from '@utils/getContext';

/**
 * Init domy when the dom and state are ready
 * @param app
 * @param target
 * @param $state
 */
async function initDomy(app: App, target: Element, $state: State) {
  const initialDom = new VirtualDom([target]);

  // Rendering
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

/**
 * Domy instance
 * @param app
 * @param target
 */
async function DOMY(app: App, target?: Element) {
  const targetElement = target ?? document.body;

  // State of the app
  const $state: State = {
    $state: [],
    $fn: {},
    $events: {},
    $refs: {}
  };

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
        const watcher = signal.dependencies[0] as Dependencie;
        watcher.unactive = true;
        try {
          await app.$watch![watcherName].call(getContext(undefined, $state));
        } catch (err) {
          console.error(err);
        }
        watcher.unactive = false;
      }
    });
  }

  // Setup
  if (app.$setup) {
    try {
      await app.$setup.call(getContext(undefined, $state));
    } catch (err) {
      console.error(err);
    }
  }

  if (document.readyState === 'complete') {
    initDomy(app, targetElement, $state);
  } else document.addEventListener('DOMContentLoaded', () => initDomy(app, targetElement, $state));

  // We display a message if a key doesn't exist
  const properties = ['$state', '$fn', '$setup', '$mounted', '$watch'] as (keyof App)[];
  const unknowKeys = Object.keys(app).filter(key => !properties.includes(key as any));
  if (unknowKeys.length > 0) console.error(`Unknown properties "${unknowKeys.join(', ')}"`);
}

export default DOMY;
