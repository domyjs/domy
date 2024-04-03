import { VirtualElement } from '@core/VitualDom';
import { State } from '../../domy/src/types/State';
import { Signal } from '@core/Signal';

export type AttrRendererProps = {
  $state: State;
  virtualParent: VirtualElement | null;
  virtualElement: VirtualElement;
  attr: { name: string; value: string };
  notifier: Exclude<Signal['callBackOncall'], null>;
};
