import type { Block } from '../core/Block';
import { ComponentProps } from './Component';

type Method = (...args: any[]) => any | Promise<any>;

export type State = {
  data: Record<string, unknown>;
  props?: ComponentProps;
  methods: { [fnName: string]: Method };

  refs: Record<string, Block>;
};
