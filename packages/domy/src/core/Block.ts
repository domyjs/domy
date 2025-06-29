import { callWithErrorHandling } from '../utils/callWithErrorHandling';
import { executeActionAfterAnimation } from '../utils/executeActionAfterAnimation';
import { error } from '../utils/logs';

type Transition = {
  enterTransition: string;
  enterTransitionTo: string;
  outTransition: string;
  outTransitionTo: string;
  init: boolean;
};
type TransitionType = 'enterTransition' | 'outTransition';

/**
 * Utilitary class to handle properly an element
 */
export class Block {
  public name: string | null = null;
  public key: string | null = null;
  private pluginsData = new Map<string, any>();

  public transition: Transition | null = null;
  private cleanupTransition: (() => void) | null = null;

  private cleanups: (() => void)[] = [];
  private onElChangeCbList: ((newEl: Element) => void)[] = [];

  public parentBlock: Block | null = null;

  constructor(private element: Element | Block) {}

  getDataForPluginId(pluginId: string) {
    return this.pluginsData.get(pluginId);
  }

  setDataForPluginId(pluginId: string, data: any) {
    this.pluginsData.set(pluginId, data);
  }

  get el(): Element {
    return this.element instanceof Block ? this.element.el : this.element;
  }

  private callCbForElementChange(newEl: Element) {
    for (const cb of this.onElChangeCbList) {
      cb(newEl);
    }
  }

  createNewElementBlock() {
    return new Block(this.el);
  }

  attachListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ) {
    let backEl = this.el;

    this.el.addEventListener(type, listener, options);

    this.onElementChange(newEl => {
      backEl.removeEventListener(type, listener, options);
      newEl.addEventListener(type, listener, options);
      backEl = newEl;
    });
  }

  onElementChange(cb: (newEl: Element) => void) {
    this.onElChangeCbList.push(cb);
  }

  setEl(newEl: Element | Block) {
    this.element = newEl;
    this.callCbForElementChange(this.el);
  }

  applyTransition(transitionType: TransitionType, action?: () => void) {
    if (this.cleanupTransition) this.cleanupTransition();
    if (!this.transition) return action && action();

    const transitionName = this.transition[transitionType];
    this.el.classList.add(transitionName);

    requestAnimationFrame(() => {
      const transitionNameTo = this.transition![`${transitionType}To`];
      this.el.classList.add(transitionNameTo);

      this.cleanupTransition = executeActionAfterAnimation(this.el, () => {
        this.el.classList.remove(transitionName);
        this.el.classList.remove(transitionNameTo);
        if (action) action();
        this.cleanupTransition = null;
      });
    });
  }

  replaceWith(newEl: Element | Block) {
    const oldEl = this.el;
    this.setEl(newEl);
    oldEl.replaceWith(this.el);
  }

  remove() {
    this.applyTransition('outTransition', () => this.el.remove());
  }

  isTemplate() {
    return this.el.tagName.toLowerCase() === 'template';
  }

  addCleanup(cleanup: () => void) {
    this.cleanups.push(cleanup);
    if (this.parentBlock) this.parentBlock.addCleanup(cleanup);
  }

  isTextNode() {
    return this.el.nodeType === Node.TEXT_NODE;
  }

  unmount() {
    for (const cleanup of this.cleanups) {
      callWithErrorHandling(cleanup, err => error(err));
    }

    this.cleanups.length = 0;

    if (this.element instanceof Block) this.element.unmount();
  }
}
