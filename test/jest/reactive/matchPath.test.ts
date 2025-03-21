import { reactive, watch, matchPath, registerName } from '../../../packages/reactive/dist';

describe('MatchPath tests', () => {
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
});
