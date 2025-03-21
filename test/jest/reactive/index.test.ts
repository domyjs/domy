import {
  watchEffect,
  reactive,
  unReactive,
  globalWatch,
  watch
} from '../../../packages/reactive/dist';

describe('Global Reactive System Tests', () => {
  it('Check watcher and effects are removed when the variables become unReactive', () => {
    const todo1 = reactive({ name: 'Yoann' });
    const todo2 = reactive({ name: 'Pierre' });

    const mockGlobalWatch = jest.fn();
    const mockEffect = jest.fn();
    const mockWatch = jest.fn();

    const removeGlobalWatch = globalWatch({ type: 'onSet', fn: mockGlobalWatch });
    watch({ type: 'onSet', fn: mockWatch }, () => [todo1.name, todo2.name]);
    watchEffect(() => {
      if (todo1.name) {
        mockEffect();
      }
      if (todo2.name) {
        mockEffect();
      }
    });

    expect(mockEffect).toHaveBeenCalled();
    expect(mockGlobalWatch).not.toHaveBeenCalled();
    expect(mockWatch).not.toHaveBeenCalled();

    mockEffect.mockReset();

    unReactive(todo1);

    todo1.name = 'New Name';
    todo2.name = 'New Name';
    expect(mockEffect).toHaveBeenCalled();
    expect(mockGlobalWatch).toHaveBeenCalled();
    expect(mockWatch).toHaveBeenCalled();

    mockGlobalWatch.mockReset();
    mockEffect.mockReset();
    mockWatch.mockReset();

    unReactive(todo2);

    todo1.name = 'Another Name';
    todo2.name = 'Another Name';

    expect(mockEffect).not.toHaveBeenCalled();
    expect(mockGlobalWatch).not.toHaveBeenCalled();
    expect(mockWatch).not.toHaveBeenCalled();

    removeGlobalWatch();
  });

  // Test pour matchPath

  // Test pour registerName
});
