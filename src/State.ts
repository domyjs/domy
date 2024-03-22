import { Signal } from 'Signal';

type StateObj = { [key: string]: unknown | StateObj };

class State {
  constructor(
    public name: string | null,
    public state: StateObj
  ) {
    this.init();
  }

  private init() {
    for (const key of Object.keys(this.state)) {
      const signal = new Signal(this.state[key]);
    }
  }
}
