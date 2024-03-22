import { Signal } from '@core/Signal';

export type State = {
  $state: Signal[];
  $store: any;
  $refs: Record<string, Element>;
};
