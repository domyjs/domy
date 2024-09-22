import { ComponentProps } from './Component';

type Method = (...args: any[]) => any | Promise<any>;

export type State = {
  data: Record<string, unknown>;
  props?: ComponentProps;
  methods: { [fnName: string]: Method };
  events: { [eventName: string]: Method[] };
  transitions: Map<Element, { enterTransition: string; outTransition: string }>;
  refs: Record<string, Element>;
};
