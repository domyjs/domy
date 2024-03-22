type Props = {
  code: string;
  context?: unknown;
  args?: unknown[];
  isAsync?: boolean;
  returnResult?: boolean;
};

const AsyncFunction = async function () {}.constructor;

/**
 * Allow to execute javascript code contained into a string
 * @param props
 * @returns
 */
export function func(props: Props) {
  const fn = props.isAsync ? AsyncFunction : Function;
  const code = props.returnResult ? `return ${props.code};` : props.code;
  return fn(code).bind(props.context, ...(props.args ?? []));
}
