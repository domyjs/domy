import { Signal, StateObj } from '@core/Signal';

export type State = {
  $state: Signal[];
  $events: { [eventName: string]: Element[] };
  $globalState: { [name: string]: StateObj };
  $store: { [name: string]: Signal };
  $refs: Record<string, Element>;
};
