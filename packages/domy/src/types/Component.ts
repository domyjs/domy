import { HookAPIFnDefinition } from '../core/hookAPI';
import { Data, StructuredAPIApp } from './App';

export type ComponentProps = {
  [key: string]: any;
  childrens: Element[];
};

export type Component<T extends ComponentProps> = (
  props: T
) => (componentElement: HTMLElement) => void;

export type Components = {
  [name: string]: Component<any>;
};

export type ComponentDefinition<
  T extends Record<string, any>,
  D extends Data,
  M extends string,
  A extends any[]
> = {
  html: string;
  app?: StructuredAPIApp<D, M, A> | HookAPIFnDefinition;
  components?: Components;
};
