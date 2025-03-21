import { signal, computed, isComputed } from '../../../packages/reactive/dist';

describe('Computed test', () => {
  it('should create a computed value based on a getter', () => {
    const count = signal(5);
    const doubleCount = computed(() => count.value * 2);

    expect(doubleCount.value).toBe(10);

    expect(isComputed(doubleCount)).toBe(true);
    expect(isComputed(count)).toBe(false);
  });

  it('should throw an error when trying to set value without a setter for computed', () => {
    const count = signal(5);
    const doubleCount = computed(() => count.value * 2);

    expect(() => {
      doubleCount.value = 10;
    }).toThrow();
  });

  it('should allow setting a value if a setter is provided on computed', () => {
    const count = signal(5);
    const doubleCount = computed(
      () => count.value * 2,
      newValue => {
        count.value = newValue / 2;
      }
    );

    expect(doubleCount.value).toBe(10);
    doubleCount.value = 20;

    expect(count.value).toBe(10);
    expect(doubleCount.value).toBe(20);
  });
});
