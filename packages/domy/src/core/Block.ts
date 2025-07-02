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

  cleanTransition() {
    if (this.cleanupTransition) this.cleanupTransition();
  }

  private callCbForElementChange(newEl: Element) {
    for (const cb of this.onElChangeCbList) {
      cb(newEl);
    }
  }

  createNewElementBlock() {
    return new Block(this.getEl());
  }

  attachListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ) {
    let backEl = this.getEl();

    backEl.addEventListener(type, listener, options);

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
    this.callCbForElementChange(this.getEl());
  }

  getEl(): Element {
    return this.element instanceof Block ? this.element.getEl() : this.element;
  }

  applyTransition(transitionType: TransitionType, action?: () => void) {
    if (this.cleanupTransition) this.cleanupTransition();
    if (!this.transition) return action && action();

    const currentEl = this.getEl();
    const transitionName = this.transition[transitionType];
    currentEl.classList.add(transitionName);

    requestAnimationFrame(() => {
      const transitionNameTo = this.transition![`${transitionType}To`];
      currentEl.classList.add(transitionNameTo);

      this.cleanupTransition = executeActionAfterAnimation(currentEl, () => {
        currentEl.classList.remove(transitionName);
        currentEl.classList.remove(transitionNameTo);
        if (action) action();
        this.cleanupTransition = null;
      });
    });
  }

  replaceWith(newEl: Element | Block) {
    const oldEl = this.getEl();
    this.setEl(newEl);
    oldEl.replaceWith(this.getEl());
  }

  remove() {
    const currentEl = this.getEl();
    this.applyTransition('outTransition', () => currentEl.remove());
  }

  isTemplate() {
    return this.getEl().tagName.toLowerCase() === 'template';
  }

  isTextNode() {
    return this.getEl().nodeType === Node.TEXT_NODE;
  }

  addCleanup(cleanup: () => void) {
    this.cleanups.push(cleanup);
    if (this.parentBlock) this.parentBlock.addCleanup(cleanup);
  }

  unmount() {
    for (const cleanup of this.cleanups) {
      callWithErrorHandling(cleanup, err => error(err));
    }

    this.cleanups.length = 0;

    if (this.element instanceof Block) this.element.unmount();
  }
}
