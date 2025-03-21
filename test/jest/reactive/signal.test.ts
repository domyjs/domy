import { signal, isSignal } from '../../../packages/reactive/dist';

describe('Signal tests', () => {
  it('should verify if the object is a signal', () => {
    const count = signal(0);
    expect(isSignal(count)).toBe(true);
  });

  it('should create a signal and track its value', () => {
    const count = signal(0);
    expect(isSignal(count)).toBe(true);
    count.value++;
    expect(count.value).toBe(1);
  });
});
