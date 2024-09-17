import { HookAPIFnDefinition } from '../core/hookAPI';
import { Data, StructuredAPIApp } from './App';
import { DomyDirectiveHelper } from './Domy';

export type ComponentProps = {
  props: { [key: string]: any };
  childrens: Element[];
};

export type Component<T extends ComponentProps['props'] = ComponentProps['props']> = (props: {
  componentElement: HTMLElement;
  data: { props: T };
  childrens: Element[];
  domy: DomyDirectiveHelper;
}) => void;

export type Components = {
  [name: string]: { componentSetup: Component<any>; propsName: Set<string> };
};

export type ComponentDefinition<
  D extends Data,
  M extends string,
  A extends any[],
  P extends ComponentProps['props']
> = {
  propsName: string[];
  html: string;
  app?: StructuredAPIApp<D, M, A, P> | HookAPIFnDefinition;
  components?: Components;
};
