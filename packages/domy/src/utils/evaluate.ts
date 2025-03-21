export type EvaluateProps = {
  code: string;
  context: any;

  contextAsGlobal?: boolean;
  returnResult?: boolean;
};

/**
 * Allow to execute javascript code contained into a string with a context
 * @param props
 * @returns
 *
 * @author yoannchb-pro
 */
export function evaluate(props: EvaluateProps) {
  let code = props.returnResult ? `return (${props.code});` : props.code;
  code = props.contextAsGlobal ? `with(this){ ${code} }` : code;

  const executedValue = Function(code).call(props.context);

  return executedValue;
}
