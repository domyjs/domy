import { StateObj, Signal } from './Signal';

export const DOMY = {
  createState(name: string, state: StateObj) {
    new Signal(name, state);
  },
  initStore(state: StateObj) {
    // TODO
  }
};
