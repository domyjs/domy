export const isBindAttr = (attr: string) => attr.startsWith(':') || attr.startsWith('d-bind:');
export const isEventAttr = (attr: string) => attr.startsWith('@') || attr.startsWith('d-on:');
export const isDomyAttr = (attr: string) => attr.startsWith('d-');
export const isNormalAttr = (attr: string) =>
  !isBindAttr(attr) && !isDomyAttr(attr) && !isEventAttr(attr);
