import { isObject } from '@utils/isObject';

export class DeepProxy {
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private debounceDelay = 50;

  constructor(
    private target: any,
    private notifyAll: () => void
  ) {}

  public getProxy() {
    return this.createProxy(this.target);
  }

  private createProxy(target: any): any {
    if (!Array.isArray(target) && !isObject(target)) {
      return target;
    }

    const handler = {
      set: (target: any, property: string | symbol, value: any, receiver: any) => {
        const result = Reflect.set(target, property, value, receiver);
        this.scheduleNotify();
        return result;
      }
    };

    return new Proxy(target, handler);
  }

  private scheduleNotify() {
    if (this.debounceTimer !== null) {
      clearTimeout(this.debounceTimer);
    }
    this.debounceTimer = setTimeout(() => {
      this.notifyAll();
    }, this.debounceDelay);
  }
}
