import { SPECIAL_ATTRIBUTES } from '@constants/specialAttributes';
import { func } from '@utils/func';
import { DOMY } from './DOMY';
import { AttrRendererProps } from '@typing/AttrRendererProps';

export function domies(props: AttrRendererProps) {
  const domyAttrName = props.attr.name as (typeof SPECIAL_ATTRIBUTES)[number];

  props.virtualElement.$el.removeAttribute(domyAttrName);

  function getExecutedValue() {
    return func({
      code: props.attr.value,
      returnResult: true,
      $state: props.$state,
      virtualParent: props.virtualParent,
      virtualElement: props.virtualElement
    });
  }

  switch (domyAttrName) {
    case 'd-text':
      props.virtualElement.$el.textContent = getExecutedValue();
      break;
    case 'd-html':
      props.virtualElement.$el.innerHTML = getExecutedValue();
      break;
    case 'd-if':
      // TODO
      break;
    case 'd-show':
      (props.virtualElement.$el as HTMLElement).style.display = getExecutedValue() ? '' : 'none';
      break;
    case 'd-ref':
      props.$state.$refs[props.attr.value] = props.virtualElement.$el;
      break;
    case 'd-model':
      // TODO
      break;
    case 'd-for':
      // TODO
      break;
  }
}
