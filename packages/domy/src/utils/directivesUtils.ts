import { getHelpers } from './getHelpers';
import { helpersUtils } from './helpersUtils';

// A list of utils we can access in directives/prefix
export const directivesUtils = {
  ...helpersUtils,
  getHelpers
};
