export type VirtualText = {
  $el: Text;
  isDisplay: boolean;
  visited: boolean;
  content: string;
};

export type VirtualElement = {
  $el: Element;
  key?: string;
  tag: string;
  isDisplay: boolean;
  visited: boolean;
  events: Record<string, EventListenerOrEventListenerObject>;
  initialised: boolean;
  domiesAttributes: {
    [name: string]: string;
  };
  normalAttributes: {
    [name: string]: string;
  };
  childs: (VirtualElement | VirtualText)[];
};
