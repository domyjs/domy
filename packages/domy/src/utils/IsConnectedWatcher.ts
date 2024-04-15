import { error } from './logs';

type Callback = () => void;

export class IsConnectedWatcher {
  private observer: MutationObserver;
  private elements: Map<Element, { lastIsConnected: boolean; callbacks: Callback[] }> = new Map();
  private static instance: IsConnectedWatcher;

  constructor() {
    this.observer = new MutationObserver(this.handleMutations.bind(this));
    this.observer.observe(document.body, { childList: true, subtree: true });
  }

  public static getInstance() {
    if (!this.instance) {
      this.instance = new IsConnectedWatcher();
    }
    return this.instance;
  }

  private handleMutations(mutations: MutationRecord[]) {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        for (const [element, data] of this.elements) {
          const currentIsConnected = element.isConnected;
          if (currentIsConnected !== data.lastIsConnected) {
            data.lastIsConnected = currentIsConnected;
            for (const callback of data.callbacks) {
              try {
                callback();
              } catch (err: any) {
                error(err);
              }
            }
          }
        }
      }
    }
  }

  watch(elements: Element[], callback: Callback): void {
    for (const element of elements) {
      if (this.elements.has(element)) {
        const old = this.elements.get(element);
        old!.callbacks.push(callback);
      } else {
        this.elements.set(element, {
          lastIsConnected: element.isConnected,
          callbacks: [callback]
        });
      }
    }
  }

  unwatch(element: Element): void {
    this.elements.delete(element);
  }

  disconnect() {
    this.observer.disconnect();
  }
}
