import { skipReactive, reactive, watch, isReactive } from '../../../packages/reactive/dist';

describe('SkipReactive tests', () => {
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
});
