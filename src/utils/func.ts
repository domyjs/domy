import { renderElement } from '@core/renderElement';
import { DOMY } from '@core/DOMY';
import { VirtualElement } from '@core/VitualDom';
import { State } from '@typing/State';

type Props = {
  code: string;
  $state: State;
  virtualParent: VirtualElement | null;
  virtualElement: VirtualElement;

  context?: unknown;
  isAsync?: boolean;
  returnResult?: boolean;
};

const AsyncFunction = async function () {}.constructor;

/**
 * Allow to execute javascript code contained into a string with the current state
 * @param props
 * @returns
 */
export function func(props: Props) {
  const fn = props.isAsync ? AsyncFunction : Function;

  const code = props.returnResult ? `return ${props.code};` : props.code;
  const stateKeys = props.$state.$state.map(state => state.name);
  const stateValues = props.$state.$state;
  const globalStateKeys = Object.keys(props.$state.$globalState);
  const globalStateValues = Object.values(props.$state.$globalState);

  for (const signal of [...stateValues, ...Object.values(props.$state.$store)]) {
    signal.setCallBackOnCall(() =>
      signal.attach({
        $el: props.virtualElement.$el,
        fn: () => renderElement(props.virtualParent, props.virtualElement)
      })
    );
  }

  return fn(...stateKeys, ...globalStateKeys, '$el', '$refs', '$store', code).bind(
    props.context ?? window,
    ...stateValues,
    ...globalStateValues,
    props.virtualElement.$el,
    props.$state.$refs,
    props.$state.$store
  )();
}
