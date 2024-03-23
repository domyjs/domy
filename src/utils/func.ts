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
 * Allow to dispatch a custom event on all elements attached to it
 * @param state
 * @string
 */
function dispatchCustomEvent($state: State) {
  return (eventName: string) => {
    const attachedElements = $state.$events[eventName] ?? [];
    for (const attachedElement of attachedElements) {
      attachedElement.dispatchEvent(new CustomEvent(eventName));
    }
  };
}

/**
 * Allow to execute javascript code contained into a string with the current state
 * @param props
 * @returns
 */
export function func(props: Props) {
  const fn = props.isAsync ? AsyncFunction : Function;

  const code = props.returnResult ? `return ${props.code};` : props.code;
  const alreadyExistingName: string[] = [];
  const stateKeys = new Set(props.$state.$state.map(state => state.name));
  const stateValues = props.$state.$state.filter(signal => {
    if (alreadyExistingName.includes(signal.name)) return false;
    alreadyExistingName.push(signal.name);
    return true;
  });

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
    dispatchCustomEvent(props.$state)
  )();
}
