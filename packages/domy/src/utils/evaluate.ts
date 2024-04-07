type Props = {
  code: string;
  context: any;

  contextAsGlobal?: boolean;
  isAsync?: boolean;
  returnResult?: boolean;
};

const AsyncFunction = async function () {}.constructor;

/**
 * Allow to execute javascript code contained into a string with the current state
 * @param props
 * @returns
 */
export function evaluate(props: Props) {
  const fn = props.isAsync ? AsyncFunction : Function;

  let code = props.returnResult ? `return ${props.code};` : props.code;
  code = props.contextAsGlobal ? `with(this){ ${code} }` : code;

  // In case we have multiple signal with same name we keep the last added one
  // const alreadyExistingName: string[] = [];
  // const stateValues = props.$state.$state.filter(signal => {
  //   if (alreadyExistingName.includes(signal.name)) return false;
  //   alreadyExistingName.push(signal.name);
  //   return true;
  // });

  // const needSpy =
  //   'content' in props.virtualElement
  //     ? true
  //     : typeof props.virtualElement.domiesAttributes['d-once'] !== 'string';

  // We spy every dependencie to attach a listener if needed
  // if (typeof props.notifier === 'function' && needSpy) {
  //   for (const signal of stateValues) {
  //     signal.callBackOncall = () =>
  //       signal.attach({
  //         $el,
  //         attrName: props.attrName,
  //         dontRemoveOnDisconnect: props.attrName === 'd-if', // We don't want to unattach the dependencie if the element doesnt exist anymore for a d-if
  //         fn: props.notifier as Exclude<Props['notifier'], undefined>
  //       });
  //   }
  // }

  // const context = getContext(props.el, {
  //   ...props.$state,
  //   $state: stateValues
  // });

  const executedValue = fn(code).call(props.context);

  return executedValue;
}
