import { fixeAttrName, getDomyAttributeInformations } from './domyAttrUtils';
import { executeActionAfterAnimation } from './executeActionAfterAnimation';
import { get, set } from './getAndSet';
import { getElementVisibilityHandler } from './getElementVisibilityHandler';
import { getPreviousConditionsElements } from './getPreviousConditionsElements';
import { getReactiveHandler } from './getReactiveHandler';
import { isBindAttr, isDomyAttr, isEventAttr, isNormalAttr } from './isSpecialAttribute';
import { kebabToCamelCase } from './kebabToCamelCase';
import { error, warn } from './logs';
import { mergeToNegativeCondition } from './mergeToNegativeCondition';
import { moveElement } from './moveElement';
import { toKebabCase } from './toKebabCase';
import { toRegularFn } from './toRegularFn';

// A list of utils we can access in helpers
export const helpersUtils = {
  toKebabCase,
  kebabToCamelCase,
  getElementVisibilityHandler,
  get,
  set,
  getPreviousConditionsElements,
  moveElement,
  toRegularFn,
  executeActionAfterAnimation,
  getReactiveHandler,
  mergeToNegativeCondition,
  fixeAttrName,
  getDomyAttributeInformations,
  isDomyAttr,
  isNormalAttr,
  isEventAttr,
  isBindAttr,
  warn,
  error
};
