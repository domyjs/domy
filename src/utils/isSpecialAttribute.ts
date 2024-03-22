import { SPECIAL_ATTRIBUTES } from '@constants/specialAttributes';

export const isBindAttr = (attr: string) => attr.startsWith(':');
export const isEventAttr = (attr: string) => attr.startsWith('@');
export const isDomyAttr = (attr: string) => SPECIAL_ATTRIBUTES.includes(attr as any);
export const isNormalAttr = (attr: string) =>
  !isBindAttr(attr) && !isDomyAttr(attr) && !isEventAttr(attr);
