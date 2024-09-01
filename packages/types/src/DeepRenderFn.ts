import { State } from './State';

export type DeepRenderProps = {
  state: State;
  element: Element;
  byPassAttributes?: string[];
  scopedNodeData?: Record<string, any>[];
  renderWithoutListeningToChange?: boolean;
};

export type DeepRenderFn = (props: DeepRenderProps) => void;
