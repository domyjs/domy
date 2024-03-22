import { VirtualElement } from '@core/VitualDom';
import { State } from './State';

export type AttrRendererProps = {
  $state: State;
  virtualParent: VirtualElement | null;
  virtualElement: VirtualElement;
  attr: { name: string; value: string };
};
