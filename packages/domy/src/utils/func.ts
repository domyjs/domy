import { VirtualElement, VirtualText } from '../core/VitualDom';
import { AttrRendererProps } from '@domyjs/types';
import { State } from '@domyjs/types';
import { getContext } from './getContext';

type Props = {
  code: string;
  $state: State;
  virtualParent: VirtualElement | null;
  virtualElement: VirtualElement | VirtualText;

  attrName?: string;
  notifier?: AttrRendererProps['notifier'];
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

  const needSpy =
    'content' in props.virtualElement
      ? true
      : typeof props.virtualElement.domiesAttributes['d-once'] !== 'string';

  // We spy every dependencie to attach a listener if needed
  if (typeof props.notifier === 'function' && needSpy) {
    for (const signal of stateValues) {
      signal.callBackOncall = () =>
        signal.attach({
          $el,
          attrName: props.attrName,
          dontRemoveOnDisconnect: props.attrName === 'd-if', // We don't want to unattach the dependencie if the element doesnt exist anymore for a d-if
          fn: props.notifier as Exclude<Props['notifier'], undefined>
        });
    }
  }

  const context = getContext($el, {
    ...props.$state,
    $state: stateValues
  });

  const executedValue = fn(code).call(context);

  return executedValue;
}
