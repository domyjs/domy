import { AttrRendererProps } from '@typing/AttrRendererProps';

export function dModel(props: AttrRendererProps) {
  const $el = props.virtualElement.$el;
  const $state = props.$state;

  const signalName = props.attr.value;
  const currentSignal = $state.$state.find(state => state.name === signalName);

  function changeValue() {
    currentSignal?.set(($el as HTMLInputElement)?.value ?? '');
  }

  $el.addEventListener('input', changeValue);
  $el.addEventListener('change', changeValue);
}
