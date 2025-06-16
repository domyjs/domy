import { reactive, signal, watch } from '../../../packages/reactive/dist';

describe('Watch tests', () => {
  it('should watch specific reactive property and trigger callback', () => {
    const todo = reactive({ name: 'Yoann' });
    const mockWatch = jest.fn();
    const unwatch = watch({ type: 'onSet', fn: mockWatch }, () => [todo.name]);

    todo.name = 'New Name';

    expect(mockWatch).toHaveBeenCalledWith(
      expect.objectContaining({
        prevValue: 'Yoann',
        newValue: 'New Name',
        path: 'name',
        reactiveVariable: expect.any(Object)
      })
    );

    unwatch();
  });

  it('should trigger watch when signal value changes', () => {
    const count = signal(0);
    const mockWatch = jest.fn();

    const unwatch = watch({ type: 'onSet', fn: mockWatch }, () => count);

    count.value++;

    expect(mockWatch).toHaveBeenCalledWith(
      expect.objectContaining({
        prevValue: 0,
        newValue: 1,
        path: 'value',
        reactiveVariable: expect.any(Object)
      })
    );

    unwatch();
  });
});
