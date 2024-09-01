import { reactivesVariablesList } from './data';

/**
 * Register a name for a reactive variable
 * It allow us to have a correct path name
 * Example of use case:
 * cont count = signal(0);
 * watch(({ path }) => console.log(path), [count]);
 * count.value += 1;
 *
 * The path is going to be "value" instead of "count.value" because we don't know the variable name
 * So to fixe that we just need to put registerName("count", count) after the variable declaration
 * @param name
 * @param obj
 * @returns
 *
 * @author yoannchb-pro
 */
export function registerName(name: string, obj: any) {
  for (const reactiveVariable of reactivesVariablesList) {
    if (reactiveVariable.getProxy() === obj) {
      reactiveVariable.name = name + '.';
      return;
    }
  }
}
