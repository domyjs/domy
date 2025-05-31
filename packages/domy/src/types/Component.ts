import { PluginHelper } from '../core/plugin';
import { App } from './App';
import { DomyDirectiveHelper } from './Domy';

export type ComponentInfos = {
  componentData: {
    $props: { [key: string]: any };
    $attrs: { [key: string]: string };
  };

  childrens: Element[];
  names: { [name: string]: Element | undefined };
  parentPluginHelper: PluginHelper;
};

export type Component = (props: {
  name: string;
  componentElement: HTMLElement;
  domy: DomyDirectiveHelper;
}) => void | (() => Element);

export type Components = {
  [name: string]: Component;
};

export type ComponentDefinition = {
  html: string;
  props?: string[];
  app?: App;
  components?: Components;
};
