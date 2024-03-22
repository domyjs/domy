import { DOMY, renderElement } from '@core/core';
import { Signal } from '@core/Signal';

type Props = {
  code: string;
  context?: unknown;
  $state?: Signal[];
  $el?: Element;
  isAsync?: boolean;
  returnResult?: boolean;
};

const AsyncFunction = async function () {}.constructor;

/**
 * Allow to execute javascript code contained into a string
 * @param props
 * @returns
 */
export function func(props: Props) {
  const fn = props.isAsync ? AsyncFunction : Function;

  const code = props.returnResult ? `return ${props.code};` : props.code;
  const stateKeys = props.$state?.map(state => state.name) ?? [];
  const stateValues = props.$state ?? [];

  for (const signal of stateValues) {
    signal.setCallBackOnCall(
      () =>
        props.$el &&
        signal.attach({ $el: props.$el, fn: () => props.$el && renderElement(props.$el) })
    );
  }

  return fn(...stateKeys, '$el', '$state', '$refs', code).bind(
    props.context ?? window,
    ...stateValues,
    props.$el,
    props.$state,
    DOMY.$refs
  )();
}
