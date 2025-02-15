import {
  skipReactive,
  watchEffect,
  lockWatchers,
  unlockWatchers,
  reactive,
  unReactive,
  signal,
  globalWatch,
  watch,
  matchPath,
  registerName,
  isSignal,
  isReactive,
  trackDeps
} from '../../../packages/reactive/dist';

describe('Reactive System Tests', () => {
  it('should skip reactivity for an object', () => {
    const mockWatch = jest.fn();

    const obj = skipReactive({ test: true });
    const reactiveObj = reactive({ obj });

    watch({ type: 'onSet', fn: mockWatch }, () => reactiveObj.obj);

    reactiveObj.obj.test = false;

    expect(isReactive(reactiveObj)).toBe(true);
    expect(isReactive(reactiveObj.obj)).toBe(false);
    expect(mockWatch).not.toHaveBeenCalled();
  });

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
      if (dep.type === 'effect') dep.uneffect();
      if (dep.type === 'global_watcher') dep.removeGlobalWatcher();
      if (dep.type === 'watcher') dep.unwatch();
    }

    if (todo) (todo as { name: string }).name = 'Will';
    expect(mockEffect).not.toHaveBeenCalled();
    expect(mockGlobalWatch).not.toHaveBeenCalled();
    expect(mockWatch).not.toHaveBeenCalled();
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

  it('should create a reactive object', () => {
    const todo = reactive({ name: 'Yoann' });
    expect(isReactive(todo)).toBe(true);
    todo.name = 'New Name';
    expect(todo.name).toBe('New Name');
  });

  it('should remove reactivity from an object', () => {
    const mockWatch = jest.fn();
    const todo = reactive({ name: 'Yoann' });

    watch({ type: 'onSet', fn: mockWatch }, () => todo.name);

    unReactive(todo);
    todo.name = 'Pierre';

    expect(mockWatch).not.toHaveBeenCalled();
  });

  it('should create a signal and track its value', () => {
    const count = signal(0);
    expect(isSignal(count)).toBe(true);
    count.value++;
    expect(count.value).toBe(1);
  });

  it('should trigger global watcher when any reactive changes', () => {
    const todo = reactive({ name: 'Yoann' });
    const mockGlobalWatch = jest.fn();
    globalWatch({ type: 'onSet', fn: mockGlobalWatch });

    todo.name = 'New Name';
    expect(mockGlobalWatch).toHaveBeenCalledWith({
      newValue: 'New Name',
      prevValue: 'Yoann',
      obj: todo,
      path: 'name'
    });
  });

  it('should watch specific reactive property and trigger callback', () => {
    const todo = reactive({ name: 'Yoann' });
    const mockWatch = jest.fn();
    const unwatch = watch({ type: 'onSet', fn: mockWatch }, () => [todo.name]);

    todo.name = 'New Name';
    expect(mockWatch).toHaveBeenCalledWith({
      prevValue: 'Yoann',
      newValue: 'New Name',
      obj: todo,
      path: 'name'
    });
    unwatch();
  });

  // Test pour matchPath
  it('should match the correct path in an object', () => {
    const todo = reactive({ name: 'Yoann' });
    registerName('todo', todo);

    let objPath: string = '';
    const unwatch = watch(
      {
        type: 'onSet',
        fn: ({ path }) => {
          objPath = path;
        }
      },
      () => todo
    );

    todo.name = 'Pierre';

    expect(matchPath('todo.{property}', objPath)).toEqual({
      isMatching: true,
      params: {
        property: 'name'
      }
    });

    unwatch();
  });

  // Test pour registerName
  it('should register a name to a reactive object', () => {
    const mockWatch = jest.fn();
    const todo = reactive({ name: 'Yoann' });
    registerName('todo', todo);

    const unwatch = watch(
      {
        type: 'onSet',
        fn: mockWatch
      },
      () => todo
    );

    todo.name = 'Pierre';

    expect(mockWatch).toHaveBeenCalledWith({
      prevValue: 'Yoann',
      newValue: 'Pierre',
      obj: todo,
      path: 'todo.name'
    });

    unwatch();
  });

  it('should trigger watch when signal value changes', () => {
    const count = signal(0);
    const mockWatch = jest.fn();

    const unwatch = watch({ type: 'onSet', fn: mockWatch }, () => count);

    count.value++;

    expect(mockWatch).toHaveBeenCalledWith({
      prevValue: 0,
      newValue: 1,
      obj: count,
      path: 'value'
    });

    unwatch();
  });

  it('should verify if the object is a signal', () => {
    const count = signal(0);
    expect(isSignal(count)).toBe(true);
  });

  it('should verify if the object is reactive', () => {
    const todo = reactive({ name: 'Yoann', list: [] as any[] });
    expect(isReactive(todo)).toBe(true);
    expect(isReactive(todo.list)).toBe(true);
  });

  it('should react to deep changes in reactive list, including setting a property like priority', () => {
    const mockWatch = jest.fn();

    const todo = reactive({ name: 'Yoann', list: [] as any[] });

    const unwatch = watch({ type: 'onSet', fn: mockWatch }, () => todo.list);

    todo.list.push('New Task');

    expect(mockWatch).toHaveBeenCalledWith({
      prevValue: undefined,
      newValue: 'New Task',
      obj: todo,
      path: 'list.0'
    });

    todo.list.push('Another Task');

    expect(mockWatch).toHaveBeenCalledWith({
      prevValue: undefined,
      newValue: 'Another Task',
      obj: todo,
      path: 'list.1'
    });

    const newTaskObj = { title: 'Task 1', completed: false };
    todo.list.push(newTaskObj);

    expect(mockWatch).toHaveBeenCalledWith({
      prevValue: undefined,
      newValue: newTaskObj,
      obj: todo,
      path: 'list.2'
    });

    expect(isReactive(todo.list[2])).toBe(true);

    todo.list[2].priority = 'high';

    expect(mockWatch).toHaveBeenCalled();

    expect(todo.list[2].priority).toBe('high');

    unwatch();
  });
});
