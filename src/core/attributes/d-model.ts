import { Dependencie } from '@core/Signal';
import { AttrRendererProps } from '@typing/AttrRendererProps';

const EVENT_KEY = 'dMdodelEvents';

export function dModel(props: AttrRendererProps) {
  const $el = props.virtualElement.$el as HTMLInputElement;
  const $state = props.$state;
  const eventSet = props.virtualElement.events[EVENT_KEY];

  const signalName = props.attr.value.replace(/^this\./, '');
  const currentSignal = $state.$state.find(state => state.name === signalName);

  if (!currentSignal) throw new Error(`Invalide data name in d-model: "${signalName}"`);

  function changeValue() {
    const dep = currentSignal!.dependencies.find(dep => dep.$el === $el) as Dependencie;
    dep.unactive = true;
    currentSignal!.set($el?.value ?? '');
    dep.unactive = false;
  }

  // Listener handler
  if (eventSet) {
    $el.removeEventListener('input', eventSet);
    $el.removeEventListener('change', eventSet);
  }

  $el.addEventListener('input', changeValue);
  $el.addEventListener('change', changeValue);

  props.virtualElement.events[EVENT_KEY] = changeValue;

  // Set the current value of the variable to the input
  if ('value' in $el) $el.value = currentSignal.val;

  // Attach the listener to change the value if the variable is changed
  currentSignal?.attach({
    $el,
    fn: props.notifier
  });
}
