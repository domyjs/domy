import { VirtualElement } from '@core/VitualDom';
import { AttrRendererProps } from '@typing/AttrRendererProps';
import { State } from '@typing/State';

type Props = {
  code: string;
  $state: State;
  virtualParent: VirtualElement | null;
  virtualElement: VirtualElement;
  notifier: AttrRendererProps['notifier'];

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

  for (const signal of [...stateValues, ...Object.values(props.$state.$store)]) {
    signal.setCallBackOnCall(() =>
      signal.attach({
        $el: props.virtualElement.$el,
        fn: props.notifier
      })
    );
  }

  return fn(...stateKeys, '$el', '$refs', '$store', '$state', code).bind(
    props.context ?? window,
    ...stateValues,
    props.virtualElement.$el,
    props.$state.$refs,
    props.$state.$store,
    props.$state.$globalState
  )();
}
