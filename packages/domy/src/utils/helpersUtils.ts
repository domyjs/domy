import { handleClass, handleRemoveClass, handleRemoveStyle, handleStyle } from '../core/binding';
import { callWithErrorHandling } from './callWithErrorHandling';
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
import { toKebabCase } from './toKebabCase';

// A list of utils we can access in helpers
export const helpersUtils = {
  handleClass,
  handleStyle,
  handleRemoveClass,
  handleRemoveStyle,
  callWithErrorHandling,
  toKebabCase,
  kebabToCamelCase,
  getElementVisibilityHandler,
  get,
  set,
  getPreviousConditionsElements,
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
