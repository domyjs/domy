import { $state } from './renderElement';
import { StateObj, Signal } from './Signal';

export const DOMY = {
  createState(name: string, state: StateObj) {
    new Signal(name, state);
  },
  store(state: StateObj) {
    if (Object.keys($state.$store).length > 0)
      throw new Error('You can only create one store by page');

    for (const key in state) {
      $state.$store[key] = new Signal(key, state[key]);
    }
  }
};
