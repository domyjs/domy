import { Signal } from '@core/Signal';

export type State = {
  isInitialised: boolean;
  $state: Signal[];
  $fn: { [fnName: string]: (...args: any[]) => any | Promise<any> };
  $events: { [eventName: string]: Element[] };
  $refs: Record<string, Element>;
};
