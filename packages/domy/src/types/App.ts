import { Helpers } from './Helpers';

export type WatcherFn = (
  prevValue: any,
  newValue: any,
  utils: { path: string; params: Record<string, string> }
) => void | Promise<void>;

export type StructuredAPIApp = {
  setup?: () => void | Promise<void>;
  mounted?: () => void | Promise<void>;
  watch?: {
    [depName: string]: WatcherFn;
  };
  data?: { [depName: string]: any };
  methods?: { [fnName: string]: (...args: any[]) => any | Promise<any> };
};

export type HookAPIApp = {
  mounted?: (props: { helpers: Helpers }) => void | Promise<void>;
  data?: { [depName: string]: any };
  methods?: { [fnName: string]: (...args: any[]) => any | Promise<any> };
};

export type App = StructuredAPIApp | HookAPIApp;
