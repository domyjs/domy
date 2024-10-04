import { ComponentProps } from './Component';
import { Helpers } from './Helpers';
import type { OnSetListener } from '@domyjs/reactive/src/core/ReactiveVariable';

export type Data = { [depName: string]: any };

type MethodFn<
  D extends Data,
  M extends Methods<D, string, A, P>,
  A extends any[],
  P extends ComponentProps['props']
> = (
  this: D & M & { $props: P } & { $childrens: Element[] } & Helpers,
  ...args: A
) => any | Promise<any>;

type Methods<
  D extends Data,
  M extends string,
  A extends any[],
  P extends ComponentProps['props']
> = {
  [fnName in M]: MethodFn<D, Methods<D, M, A, P>, A, P>;
};

// The generic types are usefull here for createApp because it allow us to keep the typing of this into the methods
export type StructuredAPIApp<
  D extends Data = any,
  M extends string = any,
  A extends any[] = any[],
  P extends ComponentProps['props'] = Record<string, never>
> = {
  setup?: () => void | Promise<void>;
  mounted?: () => void | Promise<void>;
  unmounted?: () => void | Promise<void>;
  watch?: {
    [depName: string]: OnSetListener['fn'];
  };
  data?: () => D;
  methods?: Methods<D, M, A, P>;
};

export type HookAPIApp = {
  unmounted?: (props: { helpers: Helpers }) => void | Promise<void>;
  mounted?: (props: { helpers: Helpers }) => void | Promise<void>;
  data?: { [depName: string]: any };
  methods?: { [fnName: string]: (...args: any[]) => any | Promise<any> };
};

export type App = StructuredAPIApp | HookAPIApp;
