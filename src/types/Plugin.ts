import { State } from './State';
import { VirtualElement, VirtualText } from '../core/VitualDom';
import { Signal } from '@core/Signal';

export type PluginProps = {
  $state: State;
  virtualParent: VirtualElement | null;
  virtualElement: VirtualElement | VirtualText;
  attr: { name: string; value: string };
  notifier: Exclude<Signal['callBackOncall'], null>;
};

export type Plugin = {
  type: 'attribute';
  name: string;
  fn: (props: PluginProps) => void | Promise<void>;
};
