export type App = {
  setup?: () => void | Promise<void>;
  mounted?: () => void | Promise<void>;
  watch?: {
    [depName: string]: (
      prevValue: any,
      newValue: any,
      utils: { path: string; params: Record<string, string> }
    ) => void | Promise<void>;
  };
  data?: { [depName: string]: any };
  methods?: { [fnName: string]: (...args: any[]) => any | Promise<any> };
};
