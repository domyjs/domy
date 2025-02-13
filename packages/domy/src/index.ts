import { createApp } from './core/createApp';
import { createComponent } from './core/createComponent';
import { matchPath } from '@domyjs/reactive';

const DOMY = {
  matchPath,
  createApp,
  createComponent
} as const;

export default DOMY;
