import { reactive } from '../core/reactive';

export type State = {
  data: ReturnType<typeof reactive>;
  methods: { [fnName: string]: (...args: any[]) => any | Promise<any> };
  events: { [eventName: string]: Element[] };
  transitions: Map<Element, string>;
  refs: Record<string, Element>;
};
