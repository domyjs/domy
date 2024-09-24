import { executeActionAfterAnimation } from './executeActionAfterAnimation';
import { findElementIndex } from './findElementIndex';
import { get, set } from './getAndSet';
import { getElementVisibilityHandler } from './getElementVisibilityHandler';
import { getPreviousConditionsElements } from './getPreviousConditionsElements';
import { getReactiveHandler } from './getReactiveHandler';
import { kebabToCamelCase } from './kebabToCamelCase';
import { mergeToNegativeCondition } from './mergeToNegativeCondition';
import { moveElement } from './moveElement';
import { onClone } from './onClone';
import { onReplaceWith } from './onReplaceWith';
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
  moveElement,
  restoreElement,
  toRegularFn,
  executeActionAfterAnimation,
  getReactiveHandler,
  mergeToNegativeCondition,
  onClone,
  onReplaceWith
};
