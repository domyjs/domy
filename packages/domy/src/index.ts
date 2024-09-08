import { globalWatch } from './api/globalWatch';
import { watch } from './api/watch';
import { createApp } from './core/createApp';
import { createComponent } from './core/createComponent';
import { DOMY_EVENTS } from './core/DomyEvents';
import { plugin } from './core/plugin';
import { matchPath, reactive, signal } from '@domyjs/reactive';

const DOMY = {
  signal,
  reactive,
  watch,
  matchPath,
  globalWatch,

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
