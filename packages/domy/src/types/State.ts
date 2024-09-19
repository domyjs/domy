import { ComponentProps } from './Component';

export type State = {
  data: Record<string, unknown>;
  props?: ComponentProps;
  methods: { [fnName: string]: (...args: any[]) => any | Promise<any> };
  events: { [eventName: string]: Element[] };
  transitions: Map<Element, string>;
  refs: Record<string, Element>;
};
