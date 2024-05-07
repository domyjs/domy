type Props = {
  code: string;
  context: any;

  contextAsGlobal?: boolean;
  returnResult?: boolean;
};

const AsyncFunction = async function () {}.constructor;

/**
 * Allow to execute javascript code contained into a string with a context
 * @param props
 * @returns
 *
 * @author yoannchb-pro
 */
export function evaluate(props: Props) {
  let code = props.returnResult ? `return (${props.code});` : props.code;
  code = props.contextAsGlobal ? `with(this){ ${code} }` : code;

  const executedValue = Function(code).call(props.context);

  return executedValue;
}
