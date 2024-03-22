import { $state } from './renderElement';
import { StateObj, Signal } from './Signal';

export const DOMY = {
  state(name: string, state: StateObj) {
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
