import { executeActionAfterAnimation } from '../utils/executeActionAfterAnimation';
import { error } from '../utils/logs';

type Transition = { enterTransition: string; outTransition: string; init: boolean };
type TransitionType = 'enterTransition' | 'outTransition';

export class Block {
  public key: string | null = null;

  public transition: Transition | null = null;
  private cleanupTransition: (() => void) | null = null;

  private cleanups: (() => void)[] = [];
  private onElChangeCbList: ((newEl: Element) => void)[] = [];

  constructor(public el: Element) {}

  private callCbForElementChange(newEl: Element) {
    for (const cb of this.onElChangeCbList) {
      cb(newEl);
    }
  }

  onElementChange(cb: (newEl: Element) => void) {
    this.onElChangeCbList.push(cb);
  }

  setEl(newEl: Element) {
    this.el = newEl;
    this.callCbForElementChange(newEl);
  }

  applyTransition(transitionType: TransitionType, action?: () => void) {
    if (this.cleanupTransition) this.cleanupTransition();
    if (!this.transition) return action && action();

    const transitionName = this.transition[transitionType];
    this.el.classList.add(transitionName);
    this.cleanupTransition = executeActionAfterAnimation(this.el, () => {
      this.el.classList.remove(transitionName);
      if (action) action();
    });
  }

  cloneEl(deep: boolean = false) {
    const clone = this.el.cloneNode(deep) as Element;
    this.el = clone;
    return clone;
  }

  replaceWith(newEl: Element) {
    this.el.replaceWith(newEl);
    this.el = newEl;
  }

  remove() {
    this.applyTransition('outTransition', () => this.el.remove());
  }

  isTemplate() {
    return this.el.tagName.toLowerCase() === 'template';
  }

  addCleanup(cleanup: () => void) {
    this.cleanups.push(cleanup);
  }

  unmount() {
    for (const cleanup of this.cleanups) {
      try {
        cleanup();
      } catch (err: any) {
        error(err);
      }
    }
  }
}
