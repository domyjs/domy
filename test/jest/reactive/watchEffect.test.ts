import { watchEffect, reactive } from '../../../packages/reactive/dist';

describe('WatchEffect tests', () => {
  it('shouldnt call it self', () => {
    const counter = reactive({ count: 0 });
    const mockEffect = jest.fn();
    const mockDepChange = jest.fn();

    const unEffect = watchEffect(
      () => {
        if (counter.count) {
          // DO NOTHING
        }
        mockEffect();
      },
      {
        noSelfUpdate: true,
        onDepChange() {
          mockDepChange();
        }
      }
    );

    expect(mockEffect).toHaveBeenCalled();
    expect(mockDepChange).not.toHaveBeenCalled();

    mockEffect.mockReset();
    mockDepChange.mockReset();
    ++counter.count;
    expect(mockEffect).not.toHaveBeenCalled();
    expect(mockDepChange).toHaveBeenCalled();

    // Stop watching changes
    unEffect();
  });

  it('should no listening to dependencies of an other effect inside the current', () => {
    const todo = reactive({ name: 'Yoann' });
    const mockEffect = jest.fn();
    const mockInsideEffect = jest.fn();

    let unEffectInside: (() => void) | null = null;
    const unEffect = watchEffect(() => {
      unEffectInside = watchEffect(() => {
        if (todo.name) {
          mockInsideEffect();
        }
      });
      mockEffect();
    });

    expect(mockEffect).toHaveBeenCalled();
    expect(mockInsideEffect).toHaveBeenCalled();

    mockEffect.mockReset();
    mockInsideEffect.mockReset();
    todo.name = 'New Name';
    expect(mockEffect).not.toHaveBeenCalled();
    expect(mockInsideEffect).toHaveBeenCalled();

    // Stop watching changes
    unEffect();
    if (unEffectInside) (unEffectInside as () => void)();

    mockInsideEffect.mockReset();
    todo.name = 'new Name 3';
    expect(mockInsideEffect).not.toHaveBeenCalled();
  });

  it('should trigger effect when reactive data changes', () => {
    const todo = reactive({ name: 'Yoann' });
    const mockEffect = jest.fn();
    const unEffect = watchEffect(() => {
      if (todo.name) {
        // DO SOMETHING
      }
      mockEffect();
    });

    expect(mockEffect).toHaveBeenCalled();

    mockEffect.mockReset();
    todo.name = 'New Name';
    expect(mockEffect).toHaveBeenCalled();

    mockEffect.mockReset();
    todo.name = 'new Name 2';
    expect(mockEffect).toHaveBeenCalled();

    // Stop watching changes
    unEffect();

    mockEffect.mockReset();
    todo.name = 'new Name 3';
    expect(mockEffect).not.toHaveBeenCalled();
  });
});
