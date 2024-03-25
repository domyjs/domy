import { DeepProxy } from '../utils/DeepProxy';

export type Dependencie = { $el: Element | Text | null; fn: () => void };

/**
 * Create a signal to spy a variable and notify the observers that need this dependencie
 */
export class Signal {
  private callBackOncall: (() => void) | null = null;
  public dependencies: Dependencie[] = [];

  constructor(
    public name: string,
    public val: any,
    public needProxy = true
  ) {
    this.val = this.getProxy();
  }

  public getProxy() {
    if (this.needProxy) {
      const deepProxy = new DeepProxy(this.val, () => this.notifyAll());
      return deepProxy.getProxy();
    } else {
      return this.val;
    }
  }

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
    console.log('setter called');
    this.val = typeof setter === 'function' ? setter(this.val) : setter;
    this.val = this.getProxy();
    this.notifyAll();
    return true;
  }

  public notifyAll() {
    console.log('notify called');
    for (const dep of this.dependencies) {
      dep.fn();
    }
  }

  get value() {
    if (typeof this.callBackOncall === 'function') this.callBackOncall();
    return this.val;
  }
}
