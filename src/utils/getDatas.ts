import { Signal } from '@core/Signal';
import { AttrRendererProps } from '@typing/AttrRendererProps';
import { func } from './func';

/**
 * Handle d-data attributes
 * Return the datas
 * @param props
 * @return
 */
export function getDatas(props: Omit<AttrRendererProps, 'attr'>) {
  const obj = func({
    code: props.virtualElement.domiesAttributes['d-data'],
    $state: props.$state,
    returnResult: true,
    virtualElement: props.virtualElement,
    virtualParent: props.virtualParent,
    notifier: props.notifier
  });

  props.virtualElement.$el.removeAttribute('d-data');

  const signals: Signal[] = [];
  for (const key of Object.keys(obj)) {
    signals.push(new Signal(key, obj[key]));
  }

  return signals;
}
