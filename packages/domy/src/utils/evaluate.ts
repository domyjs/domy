type Props = {
  code: string;
  context: any;

  contextAsGlobal?: boolean;
  isAsync?: boolean;
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
  const fn = props.isAsync ? AsyncFunction : Function;

  let code = props.returnResult ? `return ${props.code};` : props.code;
  code = props.contextAsGlobal ? `with(this){ ${code} }` : code;

  const executedValue = fn(code).call(props.context);

  return executedValue;
}
