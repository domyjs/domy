export type App = {
  setup?: () => void | Promise<void>;
  mounted?: () => void | Promise<void>;
  watch?: { [depName: string]: (prevValue: any, newValue: any) => void | Promise<void> };
  data?: { [depName: string]: any };
  methods?: { [fnName: string]: (...args: any[]) => any | Promise<any> };
};
