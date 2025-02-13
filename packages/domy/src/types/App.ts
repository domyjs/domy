import { ComponentInfos } from './Component';
import { Helpers } from './Helpers';
import type { OnSetListener } from '@domyjs/reactive/src/core/ReactiveVariable';

export type Data = { [depName: string]: any };

type MethodFn<
  D extends Data,
  M extends Methods<D, string, A, P>,
  A extends any[],
  P extends ComponentInfos['componentData']['$props'] = Record<string, never>
> = (
  this: D & M & { $props: P } & { $childrens: Element[] } & Helpers,
  ...args: A
) => any | Promise<any>;

type Methods<
  D extends Data,
  M extends string,
  A extends any[],
  P extends ComponentInfos['componentData']['$props'] = Record<string, never>
> = {
  [fnName in M]: MethodFn<D, Methods<D, M, A, P>, A, P>;
};

// The generic types are usefull here for createApp because it allow us to keep the typing of this into the methods
export type App<
  D extends Data = any,
  M extends string = any,
  A extends any[] = any[],
  P extends ComponentInfos['componentData']['$props'] = Record<string, never>
> = {
  setup?: () => void | Promise<void>;
  mounted?: () => void | Promise<void>;
  unmount?: () => void | Promise<void>;
  watch?: {
    [depName: string]: OnSetListener['fn'];
  };
  data?: () => D;
  methods?: Methods<D, M, A, P>;
};
