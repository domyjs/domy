import { Signal } from './Signal';

export type State = {
  data: Signal[];
  methods: { [fnName: string]: (...args: any[]) => any | Promise<any> };
  events: { [eventName: string]: Element[] };
  refs: Record<string, Element>;
};
