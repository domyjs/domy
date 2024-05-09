export type Dependencie = {
  $el?: Element | Text;
  attrName?: string;
  fn: () => void;
  dontRemoveOnDisconnect?: boolean;
  unactive?: boolean;
};

export interface Signal {
  name: string;
  val: any;
  needProxy: boolean;
  callBackOncall: (() => void) | null;
  dependencies: Dependencie[];

  getProxy(): any;
  attach(dependencie: Dependencie): void;
  set(setter: ((val: any) => any) | any): boolean;
  notifyAll(): void;
  get value(): any;
}
