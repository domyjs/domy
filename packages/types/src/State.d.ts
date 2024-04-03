import { Signal } from '../../domy/src/core/Signal';

export type State = {
  $state: Signal[];
  $fn: { [fnName: string]: (...args: any[]) => any | Promise<any> };
  $events: { [eventName: string]: Element[] };
  $refs: Record<string, Element>;
};
