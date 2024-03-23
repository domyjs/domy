import { State } from '@typing/State';

/**
 * Create a copy of the $state property
 * @param original
 * @returns
 */
export function copyState(original: State): State {
  const copy: State = {
    ...original
  };
  copy.$state = [...original.$state];
  return copy;
}
