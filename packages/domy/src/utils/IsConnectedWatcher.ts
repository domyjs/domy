import { error } from './logs';

type Callback = () => void;

/**
 * Utility class that create just one mutation oberserver
 * It will notify a callback when the visibility of a watched element change
 *
 * @author yoannchb-pro
 */
export class IsConnectedWatcher {
  private observer: MutationObserver;
  private elements: Map<Element, { lastIsConnected: boolean; callbacks: Callback[] }> = new Map();
  private static instance: IsConnectedWatcher;

  private constructor() {
    this.observer = new MutationObserver(this.handleMutations.bind(this));
    this.observer.observe(document.body, { childList: true, subtree: true });
  }

  public static getInstance() {
    if (!IsConnectedWatcher.instance) {
      IsConnectedWatcher.instance = new IsConnectedWatcher();
    }
    return IsConnectedWatcher.instance;
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
