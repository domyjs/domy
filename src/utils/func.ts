import { DOMY, renderElement } from '@core/core';
import { Signal } from '@core/Signal';
import { VirtualElement } from '@core/VitualDom';

type Props = {
  code: string;
  $state: Signal[];
  virtualElement: VirtualElement;
  context?: unknown;
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
    signal.setCallBackOnCall(() =>
      signal.attach({
        $el: props.virtualElement.$el,
        fn: () => renderElement(props.virtualElement)
      })
    );
  }

  return fn(...stateKeys, '$el', '$state', '$refs', code).bind(
    props.context ?? window,
    ...stateValues,
    props.virtualElement.$el,
    props.$state,
    DOMY.$refs
  )();
}
