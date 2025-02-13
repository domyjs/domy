import type { Block } from '../core/Block';
import { ComponentInfos } from './Component';

type Method = (...args: any[]) => any | Promise<any>;

export type State = {
  data: Record<string, unknown>;
  componentInfos?: ComponentInfos;
  methods: { [fnName: string]: Method };

  refs: Record<string, Block>;
};
