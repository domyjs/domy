import { Signal } from './Signal';
import { State } from './State';
import { VirtualElement } from './VirtualElement';

export type AttrRendererProps = {
  $state: State;
  virtualParent: VirtualElement | null;
  virtualElement: VirtualElement;
  attr: { name: string; value: string };
  notifier: Exclude<Signal['callBackOncall'], null>;
};
