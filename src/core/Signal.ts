type Dependencie = { $el: Element; fn: () => void };

export type StateObj = { [key: string]: StateObj | unknown };

/**
 * Create a signal to spy a variable and notify the observers that need this dependencie
 */
export class Signal {
  private callBackOncall: (() => void) | null = null;
  private dependencies: Dependencie[] = [];

  constructor(
    public name: string,
    private val: any
  ) {}

  public attach(dependencie: Dependencie) {
    const $elAlreadyAttach = this.dependencies.some(dep => dep.$el === dependencie.$el);
    if (!$elAlreadyAttach) this.dependencies.push(dependencie);
  }

  public unattach($el: Element): boolean {
    const index = this.dependencies.findIndex(dep => dep.$el === $el);
    if (index === -1) return false;
    this.dependencies.splice(index, 1);
    return true;
  }

  public setCallBackOnCall(cb: (() => void) | null) {
    this.callBackOncall = cb;
  }

  public set(setter: ((val: any) => any) | any) {
    this.val = typeof setter === 'function' ? setter(this.val) : setter;
    this.notifyAll();
  }

  private notifyAll() {
    for (const dep of this.dependencies) {
      dep.fn();
    }
  }

  get value() {
    if (typeof this.callBackOncall === 'function') this.callBackOncall();
    return this.val;
  }
}
