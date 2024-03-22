import { Signal } from '@core/Signal';

export type State = {
  $state: Signal[];
  $store: { [name: string]: Signal };
  $refs: Record<string, Element>;
};
