export type App = {
  $setup?: () => void | Promise<void>;
  $mounted?: () => void | Promise<void>;
  $watch?: { [depName: string]: () => void | Promise<void> };
  $state?: { [depName: string]: any };
  $fn?: { [fnName: string]: (...args: any[]) => any | Promise<any> };
};
