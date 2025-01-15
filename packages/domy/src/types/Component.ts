import { App, Data } from './App';
import { DomyDirectiveHelper } from './Domy';

export type ComponentProps = {
  props: { [key: string]: any };
  childrens: Element[];
  names: { [name: string]: Element };
  attrs: { [key: string]: string };
};

export type Component = (props: {
  name: string;
  componentElement: HTMLElement;
  domy: DomyDirectiveHelper;
}) => void | (() => Element);

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
  app?: App<D, M, A, P>;
  components?: Components;
};
