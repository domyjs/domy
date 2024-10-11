import { createApp } from './core/createApp';
import { createComponent } from './core/createComponent';
import { DOMY_EVENTS } from './core/DomyEvents';
import { plugin } from './core/plugin';
import { matchPath } from '@domyjs/reactive';

const DOMY = {
  matchPath,
  createApp,
  createComponent,
  plugin
} as const;

// Allow the plugins to append their self when DOMY is ready
document.dispatchEvent(
  new CustomEvent(DOMY_EVENTS.Ready, {
    bubbles: true,
    detail: DOMY
  })
);

export default DOMY;
