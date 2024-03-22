import { func } from '@utils/func';
import { $state } from './renderElement';
import { Signal } from './Signal';
import { AttrRendererProps } from '@typing/AttrRendererProps';

/**
 * Handle d-data attributes
 * @param props
 */
export function data(props: AttrRendererProps) {
  const obj = func({
    code: props.attr.value,
    $state: props.$state,
    returnResult: true,
    virtualElement: props.virtualElement,
    virtualParent: props.virtualParent,
    notifier: props.notifier
  });

  props.virtualElement.$el.removeAttribute('d-data');

  // TODO: Fixe state scope
  for (const key of Object.keys(obj)) {
    $state.$state.push(new Signal(key, obj[key]));
  }
}
