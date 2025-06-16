import { reactive, globalWatch } from '../../../packages/reactive/dist';

describe('GlobalWatch tests', () => {
  it('should trigger global watcher when any reactive changes', () => {
    const todo = reactive({ name: 'Yoann' });
    const mockGlobalWatch = jest.fn();
    globalWatch({ type: 'onSet', fn: mockGlobalWatch });

    todo.name = 'New Name';

    expect(mockGlobalWatch).toHaveBeenCalledWith(
      expect.objectContaining({
        newValue: 'New Name',
        prevValue: 'Yoann',
        path: 'name',
        reactiveVariable: expect.any(Object)
      })
    );
  });
});
