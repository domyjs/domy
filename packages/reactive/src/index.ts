import { globalWatch } from './core/globalWatch';
import { isReactive } from './core/isReactive';
import { isSignal } from './core/isSignal';
import { matchPath } from './core/matchPath';
import { reactive } from './core/reactive';
import { registerName } from './core/registerName';
import { signal } from './core/signal';
import { watch } from './core/watch';
import { lockWatchers } from './core/lockWatchers';
import { unlockWatchers } from './core/unlockWatchers';
import { unReactive } from './core/unReactive';
import { skipReactive } from './core/skipReactivity';
import { watchEffect } from './core/watchEffect';

export {
  skipReactive,
  watchEffect,
  lockWatchers,
  unlockWatchers,
  reactive,
  unReactive,
  signal,
  globalWatch,
  watch,
  matchPath,
  registerName,
  isSignal,
  isReactive
};
