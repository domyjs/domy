import { concatProxiesAndObjs } from './concatProxiesAndObjs';
import { executeActionAfterAnimation } from './executeActionAfterAnimation';
import { get, set } from './getAndSet';
import { getElementVisibilityHandler } from './getElementVisibilityHandler';
import { getPreviousConditionsElements } from './getPreviousConditionsElements';
import { GlobalMutationObserver } from './GlobalMutationObserver';
import { moveElement } from './moveElement';
import { replaceElement } from './replaceElement';
import { restoreElement } from './restoreElement';
import { toRegularFn } from './toRegularFn';

// A list of utils we can access in helpers
export const helpersUtils = {
  getElementVisibilityHandler,
  get,
  set,
  getPreviousConditionsElements,
  GlobalMutationObserver,
  moveElement,
  restoreElement,
  replaceElement,
  toRegularFn,
  executeActionAfterAnimation,
  concatProxiesAndObjs
};
