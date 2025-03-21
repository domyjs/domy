import { AppState } from '../types/App';

type Observer = { type: keyof AppState; callback: () => void };

/**
 * Register the current lifecycle state of the current app
 *
 * @author yoannchb-pro
 */
export class AppStateObserver {
  private observers: Observer[] = [];

  private appState: AppState = {
    isSetuped: false,
    isMounted: false,
    isUnmounted: false
  };

  get isMounted() {
    return this.appState.isMounted;
  }

  get isSetuped() {
    return this.appState.isSetuped;
  }

  get isUnmounted() {
    return this.appState.isUnmounted;
  }

  set isMounted(newValue: boolean) {
    this.appState.isMounted = newValue;
    this.callObservers('isMounted');
  }

  set isSetuped(newValue: boolean) {
    this.appState.isSetuped = newValue;
    this.callObservers('isSetuped');
  }

  set isUnmounted(newValue: boolean) {
    this.appState.isUnmounted = newValue;
    this.callObservers('isUnmounted');
  }

  private callObservers(type: keyof AppState) {
    const observers = this.observers.filter(ob => ob.type === type);
    for (const observer of observers) {
      observer.callback();
    }
  }

  addObserver(observer: Observer) {
    this.observers.push(observer);
    return () => this.removeObserver(observer);
  }

  removeObserver(observer: Observer) {
    const index = this.observers.indexOf(observer);
    if (index !== 1) this.observers.splice(index, 1);
  }
}
