import { lockWatchers, unlockWatchers, reactive, watch } from '../../../packages/reactive/dist';

describe('Locks tests', () => {
  it('should not trigger watchers when they are locked', () => {
    const todo = reactive({ name: 'Yoann' });
    const mockWatch = jest.fn();

    lockWatchers();
    const unwatch = watch({ type: 'onSet', fn: mockWatch }, () => todo.name);
    todo.name = 'New Name';
    unlockWatchers();

    expect(mockWatch).not.toHaveBeenCalled();
    unwatch();
  });
});
