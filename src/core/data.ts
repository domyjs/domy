import { func } from '@utils/func';
import { Signal } from './Signal';
import { AttrRendererProps } from '@typing/AttrRendererProps';

/**
 * Handle d-data attributes
 * @param props
 */
export function data(props: AttrRendererProps) {
  const $el = props.virtualElement.$el;

  const obj = func({
    code: props.attr.value,
    $state: props.$state,
    returnResult: true,
    virtualElement: props.virtualElement,
    virtualParent: props.virtualParent,
    notifier: props.notifier
  });

  $el.removeAttribute('d-data');

  // TODO: Fixe state scope
  for (const key of Object.keys(obj)) {
    props.$state.$state.push(new Signal(key, obj[key]));
  }
}
