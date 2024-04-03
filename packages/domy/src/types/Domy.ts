import { Signal, State } from '@domyjs/types';
import { moveElement } from '../utils/moveElement';
import { restoreElement } from '../utils/restoreElement';
import { replaceElement } from '../utils/replaceElement';

export type DomyProps = {
  el: Element;
  attr: { name: string; value: string };
  effect: (cb: () => void | Promise<void>) => void | Promise<void>;
  cleanup: (cb: () => void | Promise<void>) => void | Promise<void>;
  $state: State;
  variants: string[];

  utils: {
    reactive: (obj: Record<string, any>) => Signal[];
    evaluate: (...args: any[]) => any;
    deepRender: (el: Element) => void;
    render: (el: Element) => void;
    moveElement: typeof moveElement;
    restoreElement: typeof restoreElement;
    replaceElement: typeof replaceElement;
  };
};

export type DomyFn = (domy: DomyProps) => void | Promise<void>;

export type Domy = {
  registerAttribute(name: string, fn: DomyFn): void;
  registerSpecial(name: string, fn: DomyFn): void;
  registerVariant(name: string, fn: DomyFn): void;

  notifyOnDataChange(name: string, fn: DomyFn): void;
};

export type DomyPlugin = (domy: Domy) => void;
