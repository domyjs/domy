export type App = {
  $init: () => void | Promise<void>;
  $watch: { [depName: string]: () => void | Promise<void> };
  $state: { [depName: string]: any };
  $fn: { [fnName: string]: (...args: any[]) => any | Promise<any> };
};
