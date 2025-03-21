import {
  watchEffect,
  reactive,
  signal,
  globalWatch,
  watch,
  trackDeps
} from '../../../packages/reactive/dist';

describe('TrackDeps tests', () => {
  it('should track dependencies', () => {
    const mockGlobalWatch = jest.fn();
    const mockEffect = jest.fn();
    const mockWatch = jest.fn();

    let todo: { name: string } | null = null;
    let count: { value: number } | null = null;

    const deps = trackDeps(() => {
      todo = reactive({ name: 'Yoann' });
      count = signal(0);

      globalWatch({ type: 'onSet', fn: mockGlobalWatch });
      watch({ type: 'onSet', fn: mockWatch }, () => [count, todo]);
      watchEffect(() => {
        if (typeof count?.value === 'number' && typeof todo?.name === 'string') {
          mockEffect();
        }
      });
    });

    expect(deps.length).toBe(5);
    expect(deps[0].type).toBe('reactive_variable_creation');
    expect(deps[1].type).toBe('reactive_variable_creation');
    expect(deps[2].type).toBe('global_watcher');
    expect(deps[3].type).toBe('watcher');
    expect(deps[4].type).toBe('effect');

    expect(mockEffect).toHaveBeenCalled();
    expect(mockGlobalWatch).not.toHaveBeenCalled();
    expect(mockWatch).not.toHaveBeenCalled();

    mockEffect.mockReset();

    if (todo) (todo as { name: string }).name = 'Pierre';
    expect(mockEffect).toHaveBeenCalled();
    expect(mockGlobalWatch).toHaveBeenCalled();
    expect(mockWatch).toHaveBeenCalled();

    mockEffect.mockReset();
    mockGlobalWatch.mockReset();
    mockWatch.mockReset();

    for (const dep of deps) {
      dep.clean();
    }

    if (todo) (todo as { name: string }).name = 'Will';
    expect(mockEffect).not.toHaveBeenCalled();
    expect(mockGlobalWatch).not.toHaveBeenCalled();
    expect(mockWatch).not.toHaveBeenCalled();
  });
});
