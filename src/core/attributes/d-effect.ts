import { AttrRendererProps } from '@typing/AttrRendererProps';
import { func } from '@utils/func';

export function dEffect(props: AttrRendererProps) {
  const executedValue = func({
    code: props.attr.value,
    returnResult: false,
    $state: props.$state,
    virtualParent: props.virtualParent,
    virtualElement: props.virtualElement,
    notifier: props.notifier
  });
  if (typeof executedValue === 'function') executedValue();
}
