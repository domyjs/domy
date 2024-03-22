import { VirtualElement } from '@core/VitualDom';
import { AttrRendererProps } from '@typing/AttrRendererProps';
import { State } from '@typing/State';
import { $state } from '@core/renderElement';

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
 * Allow to dispatch a custom event on all elements attached to it
 * @param eventName
 */
function dispatchCustomEvent(eventName: string) {
  const attachedElements = $state.$events[eventName] ?? [];
  for (const attachedElement of attachedElements) {
    attachedElement.dispatchEvent(new CustomEvent(eventName));
  }
}

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

  return fn(...stateKeys, '$el', '$refs', '$store', '$state', '$dispatch', code).bind(
    props.context ?? window,
    ...stateValues,
    props.virtualElement.$el,
    props.$state.$refs,
    props.$state.$store,
    props.$state.$globalState,
    dispatchCustomEvent
  )();
}
