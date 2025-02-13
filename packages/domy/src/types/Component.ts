import { App, Data } from './App';
import { DomyDirectiveHelper } from './Domy';

export type ComponentInfos = {
  componentData: {
    $props: { [key: string]: any };
    $attrs: { [key: string]: string };
  };

  childrens: Element[];
  names: { [name: string]: Element };
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
  P extends ComponentInfos['componentData']['$props'] = Record<string, never>
> = {
  html: string;
  props?: string[];
  app?: App<D, M, A, P>;
  components?: Components;
};
