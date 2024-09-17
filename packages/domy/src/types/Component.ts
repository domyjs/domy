import { HookAPIFnDefinition } from '../core/hookAPI';
import { Data, StructuredAPIApp } from './App';
import { DomyDirectiveHelper } from './Domy';

export type ComponentProps = {
  props: { [key: string]: any };
  childrens: Element[];
};

export type Component = (props: {
  componentElement: HTMLElement;
  domy: DomyDirectiveHelper;
}) => void;

export type Components = {
  [name: string]: Component;
};

export type ComponentDefinition<
  D extends Data,
  M extends string,
  A extends any[],
  P extends ComponentProps['props']
> = {
  html: string;
  props?: string[];
  app?: StructuredAPIApp<D, M, A, P> | HookAPIFnDefinition;
  components?: Components;
};
