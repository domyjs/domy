import { executeActionAfterAnimation } from './executeActionAfterAnimation';
import { findElementIndex } from './findElementIndex';
import { get, set } from './getAndSet';
import { getElementVisibilityHandler } from './getElementVisibilityHandler';
import { getPreviousConditionsElements } from './getPreviousConditionsElements';
import { GlobalMutationObserver } from './GlobalMutationObserver';
import { kebabToCamelCase } from './kebabToCamelCase';
import { moveElement } from './moveElement';
import { replaceElement } from './replaceElement';
import { restoreElement } from './restoreElement';
import { toKebabCase } from './toKebabCase';
import { toRegularFn } from './toRegularFn';

// A list of utils we can access in helpers
export const helpersUtils = {
  findElementIndex,
  toKebabCase,
  kebabToCamelCase,
  getElementVisibilityHandler,
  get,
  set,
  getPreviousConditionsElements,
  GlobalMutationObserver,
  moveElement,
  restoreElement,
  replaceElement,
  toRegularFn,
  executeActionAfterAnimation
};
