import { VirtualElement, VirtualText } from '@core/VitualDom';
import { AttrRendererProps } from '@typing/AttrRendererProps';
import { State } from '@typing/State';
import { getContext } from './getContext';

type Props = {
  code: string;
  $state: State;
  virtualParent: VirtualElement | null;
  virtualElement: VirtualElement | VirtualText;
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

  const $el = props.virtualElement.$el;
  const code = props.returnResult ? `return ${props.code};` : props.code;

  // In case we have multiple signal with same name we keep the last added one
  const alreadyExistingName: string[] = [];
  const stateValues = props.$state.$state.filter(signal => {
    if (alreadyExistingName.includes(signal.name)) return false;
    alreadyExistingName.push(signal.name);
    return true;
  });

  // We spy every dependencie to attach a listener if needed
  for (const signal of stateValues) {
    signal.setCallBackOnCall(() =>
      signal.attach({
        $el,
        fn: props.notifier
      })
    );
  }

  return fn(code).call(
    getContext($el, {
      ...props.$state,
      $state: stateValues
    })
  );
}
