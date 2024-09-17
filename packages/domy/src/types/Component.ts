import { HookAPIFnDefinition } from '../core/hookAPI';
import { Data, StructuredAPIApp } from './App';

export type ComponentProps = {
  props: { [key: string]: any };
  childrens: Element[];
};

export type Component<T extends ComponentProps['props'] = ComponentProps['props']> = (
  componentElement: HTMLElement,
  data: { props: T },
  childrens: Element[]
) => Promise<void>;

export type Components = {
  [name: string]: Component<any>;
};

export type ComponentDefinition<
  D extends Data,
  M extends string,
  A extends any[],
  P extends ComponentProps['props']
> = {
  html: string;
  app?: StructuredAPIApp<D, M, A, P> | HookAPIFnDefinition;
  components?: Components;
};
