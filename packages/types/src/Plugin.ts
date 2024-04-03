import { Signal } from './Signal';
import { State } from './State';
import { VirtualElement, VirtualText } from './VirtualElement';

export type PluginProps = {
  $state: State;
  virtualParent: VirtualElement | null;
  virtualElement: VirtualElement | VirtualText;
  attr: { name: string; value: string };
  notifier: Exclude<Signal['callBackOncall'], null>;
};

export type PluginType =
  | {
      type: 'attribute';
      name: string;
      fn: (props: PluginProps) => void | Promise<void>;
    }
  | {
      type: 'function';
      name: string;
      fn: (props: PluginProps) => void | Promise<void>;
    };

export type Plugin = PluginType[];
