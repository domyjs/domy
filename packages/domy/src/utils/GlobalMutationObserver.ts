import { error } from './logs';

type Callback = (element: Element | Node, mutation: MutationRecord) => void;

/**
 * Utility class that creates a global mutation observer
 * It will notify a callback when any change occurs in a watched element or its children.
 *
 * @author yoannchb-pro
 */
export class GlobalMutationObserver {
  private observer: MutationObserver;
  private elements: Map<Element, Callback[]> = new Map();
  private static instance: GlobalMutationObserver;

  private constructor() {
    this.observer = new MutationObserver(this.handleMutations.bind(this));
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true
    });
  }

  public static getInstance() {
    if (!GlobalMutationObserver.instance) {
      GlobalMutationObserver.instance = new GlobalMutationObserver();
    }
    return GlobalMutationObserver.instance;
  }

  private isElementWatched(element: Element, target: Node): boolean {
    return element.contains(target) || element === target;
  }

  private callCallbacks(
    callbacks: Callback[],
    element: Element | Node,
    mutation: MutationRecord
  ): void {
    for (const callback of callbacks) {
      try {
        callback(element, mutation);
      } catch (err: any) {
        error(err);
      }
    }
  }

  private handleMutations(mutations: MutationRecord[]): void {
    for (const mutation of mutations) {
      for (const [element, callbacks] of this.elements) {
        if (this.isElementWatched(element, mutation.target)) {
          this.callCallbacks(callbacks, element, mutation);
          continue;
        }

        for (const addedNode of mutation.addedNodes) {
          if (this.isElementWatched(element, addedNode)) {
            this.callCallbacks(callbacks, addedNode, mutation);
            break;
          }
        }

        for (const removedNode of mutation.removedNodes) {
          if (this.isElementWatched(element, removedNode)) {
            this.callCallbacks(callbacks, removedNode, mutation);
            break;
          }
        }
      }
    }
  }

  public watch(elements: Element[], callback: Callback): void {
    for (const element of elements) {
      const callbacks = this.elements.get(element);
      if (callbacks) {
        callbacks.push(callback);
      } else {
        this.elements.set(element, [callback]);
      }
    }
  }

  public unwatch(elements: Element[], callback: Callback): void {
    for (const element of elements) {
      const callbacks = this.elements.get(element);
      if (!callbacks) return;

      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }

      if (callbacks.length === 0) {
        this.elements.delete(element);
      }
    }
  }

  public disconnect(): void {
    this.observer.disconnect();
    this.elements.clear();
  }
}
