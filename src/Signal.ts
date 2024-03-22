type Dependencie = (value: unknown) => void;

export class Signal {
  private dependencies: Dependencie[] = [];

  constructor(private val: unknown) {}

  attach(dependencie: Dependencie) {
    this.dependencies.push(dependencie);
  }

  unattach(dependencie: Dependencie): boolean {
    const index = this.dependencies.findIndex(dep => dep === dependencie);
    if (index === -1) return false;
    this.dependencies.splice(index, 1);
    return true;
  }

  public set(setter: (val: unknown) => unknown | unknown) {
    this.val = typeof setter === 'function' ? setter(this.val) : setter;
    this.notifyAll();
  }

  private notifyAll() {
    for (const dep of this.dependencies) {
      dep(this.val);
    }
  }

  get value() {
    return this.val;
  }
}
