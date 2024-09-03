import { Helpers } from './Helpers';

export type Data = { [depName: string]: any };

type MethodFn<D extends Data, M extends Methods<any, D, A>, A extends any[]> = (
  this: D & M & Helpers,
  ...args: A
) => any | Promise<any>;

type Methods<M extends string, D extends Data, A extends any[]> = {
  [fnName in M]: MethodFn<D, Methods<M, D, A>, A>;
};

export type WatcherFn = (
  prevValue: any,
  newValue: any,
  utils: { path: string; params: Record<string, string> }
) => void | Promise<void>;

// The generic types are usefull here for createApp because it allow us to keep the typing of this into the methods
export type StructuredAPIApp<
  D extends Data = any,
  M extends string = any,
  A extends any[] = any[]
> = {
  setup?: () => void | Promise<void>;
  mounted?: () => void | Promise<void>;
  watch?: {
    [depName: string]: WatcherFn;
  };
  data?: D;
  methods?: Methods<M, D, A>;
};

export type HookAPIApp = {
  mounted?: (props: { helpers: Helpers }) => void | Promise<void>;
  data?: { [depName: string]: any };
  methods?: { [fnName: string]: (...args: any[]) => any | Promise<any> };
};

export type App = StructuredAPIApp | HookAPIApp;
