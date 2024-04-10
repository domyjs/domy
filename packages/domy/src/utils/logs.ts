export function warn(msg: string) {
  console.warn('(Domy Warning)', msg);
}

export function error(err: Error) {
  console.error('(Domy Error)', err);
}
