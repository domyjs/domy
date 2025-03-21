import {
  reactive,
  unReactive,
  watch,
  registerName,
  isReactive
} from '../../../packages/reactive/dist';

describe('Reactive tests', () => {
  it('should react to deep changes in reactive list, including setting a property like priority', () => {
    const mockWatch = jest.fn();

    const todo = reactive({ name: 'Yoann', list: [] as any[] });

    const unwatch = watch({ type: 'onSet', fn: mockWatch }, () => todo.list);

    todo.list.push('New Task');

    expect(mockWatch).toHaveBeenCalledWith(
      expect.objectContaining({
        prevValue: undefined,
        newValue: 'New Task',
        obj: todo,
        path: 'list.0',
        reactiveVariable: expect.any(Object)
      })
    );

    todo.list.push('Another Task');

    expect(mockWatch).toHaveBeenCalledWith(
      expect.objectContaining({
        prevValue: undefined,
        newValue: 'Another Task',
        obj: todo,
        path: 'list.1',
        reactiveVariable: expect.any(Object)
      })
    );

    const newTaskObj = { title: 'Task 1', completed: false };
    todo.list.push(newTaskObj);

    expect(mockWatch).toHaveBeenCalledWith(
      expect.objectContaining({
        prevValue: undefined,
        newValue: newTaskObj,
        obj: todo,
        path: 'list.2',
        reactiveVariable: expect.any(Object)
      })
    );

    expect(isReactive(todo.list[2])).toBe(true);

    todo.list[2].priority = 'high';

    expect(mockWatch).toHaveBeenCalled();

    expect(todo.list[2].priority).toBe('high');

    unwatch();
  });

  it('should verify if the object is reactive', () => {
    const todo = reactive({ name: 'Yoann', list: [] as any[] });
    expect(isReactive(todo)).toBe(true);
    expect(isReactive(todo.list)).toBe(true);
  });

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

    expect(mockWatch).toHaveBeenCalledWith(
      expect.objectContaining({
        prevValue: 'Yoann',
        newValue: 'Pierre',
        obj: todo,
        path: 'todo.name',
        reactiveVariable: expect.any(Object)
      })
    );

    unwatch();
  });

  it('should remove reactivity from an object', () => {
    const mockWatch = jest.fn();
    const todo = reactive({ name: 'Yoann' });

    watch({ type: 'onSet', fn: mockWatch }, () => todo.name);

    unReactive(todo);
    todo.name = 'Pierre';

    expect(mockWatch).not.toHaveBeenCalled();
  });

  it('should create a reactive object', () => {
    const todo = reactive({ name: 'Yoann' });
    expect(isReactive(todo)).toBe(true);
    todo.name = 'New Name';
    expect(todo.name).toBe('New Name');
  });
});
