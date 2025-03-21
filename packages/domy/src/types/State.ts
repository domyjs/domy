import type { Block } from '../core/Block';
import { ComponentInfos } from './Component';

export type State = {
  data: Record<string, unknown>;
  componentInfos?: ComponentInfos;
  refs: Record<string, Block>;
};
