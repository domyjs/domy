import { DomySpecialHelper } from '../types/Domy';
import { error } from '../utils/logs';

type Fn = (domy: DomySpecialHelper) => any;

/**
 * Convert a helper to a hook by providing everything it need when initialising the app
 * @returns
 *
 * @author yoannchb-pro
 */
export function createHelperToHookRegistrer() {
  const helpersHooksList = new Set<Fn>();
  let domy: DomySpecialHelper | null = null;

  return {
    getHook<T extends Fn>(helper: T): () => ReturnType<T> {
      helpersHooksList.add(helper);

      return () => {
        if (!domy) {
          error('A helper hook as been call out of a domy app body.');
          return;
        }

        return helper(domy);
      };
    },
    provideHookMandatories(domyHelper: DomySpecialHelper) {
      domy = domyHelper;
    },
    clear() {
      helpersHooksList.clear();
    }
  };
}
