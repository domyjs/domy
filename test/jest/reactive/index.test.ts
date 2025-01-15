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
  isReactive
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
