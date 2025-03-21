import { getHelpers } from './getHelpers';
import { helpersUtils } from './helpersUtils';
import { queuedWatchEffect } from './queuedWatchEffect';

// A list of utils we can access in directives/prefix
export const directivesUtils = {
  ...helpersUtils,
  getHelpers,
  queuedWatchEffect
};
