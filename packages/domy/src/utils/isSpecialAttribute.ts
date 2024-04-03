import { SPECIAL_ATTRIBUTES } from '../constants/specialAttributes';

export const isBindAttr = (attr: string) => attr.startsWith(':') || attr.startsWith('d-bind:');
export const isEventAttr = (attr: string) => attr.startsWith('@') || attr.startsWith('d-on:');
export const isDomyAttr = (attr: string) => SPECIAL_ATTRIBUTES.includes(attr as any);
export const isNormalAttr = (attr: string) =>
  !isBindAttr(attr) && !isDomyAttr(attr) && !isEventAttr(attr);
