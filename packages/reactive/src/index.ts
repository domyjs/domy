import { globalWatch } from './core/globalWatch';
import { isReactive } from './core/isReactive';
import { isSignal } from './core/isSignal';
import { matchPath } from './core/matchPath';
import { reactive } from './core/reactive';
import { registerName } from './core/registerName';
import { removeGlobalWatch } from './core/removeGlobalWatch';
import { signal } from './core/signal';
import { unwatch } from './core/unwatch';
import { watch } from './core/watch';

export {
  reactive,
  signal,
  globalWatch,
  removeGlobalWatch,
  watch,
  unwatch,
  matchPath,
  registerName,
  isSignal,
  isReactive
};
