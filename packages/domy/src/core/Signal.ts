import { DeepProxy } from '../utils/DeepProxy';
import { Signal as SignalInterface } from '@domyjs/types';

export type Dependencie = {
  $el?: Element | Text;
  attrName?: string;
  fn: () => void;

  dontRemoveOnDisconnect?: boolean;
  unactive?: boolean;
};

/**
 * Create a signal to spy a variable and notify the observers that need this dependencie
 */
export class Signal implements SignalInterface {
  public callBackOncall: (() => void) | null = null;
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
    const depAlreadyAttach = this.dependencies.some(
      dep => dep.$el === dependencie.$el && dependencie.attrName === dep.attrName
    );
    if (!depAlreadyAttach) this.dependencies.push(dependencie);
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
    for (let i = 0; i < this.dependencies.length; ++i) {
      const dep = this.dependencies[i];

      // If the element is not in the dom anymore we remove the dependencie
      if (dep.$el && !dep.$el.isConnected && !dep.dontRemoveOnDisconnect) {
        this.dependencies.splice(i, 1);
        continue;
      }

      if (!dep.unactive) dep.fn();
    }
  }

  get value() {
    if (typeof this.callBackOncall === 'function') this.callBackOncall();
    return this.val;
  }
}
