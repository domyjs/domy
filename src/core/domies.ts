import { SPECIAL_ATTRIBUTES } from '@constants/specialAttributes';
import { func } from '@utils/func';
import { AttrRendererProps } from '@typing/AttrRendererProps';
import { dFor } from './attributes/d-for';
import { dModel } from './attributes/d-model';
import { dIf } from './attributes/d-if';

/**
 * Handle attributes starting by d-*
 * @param props
 * @returns
 */
export function domies(props: AttrRendererProps) {
  const $el = props.virtualElement.$el;

  const domyAttrName = props.attr.name as (typeof SPECIAL_ATTRIBUTES)[number];

  $el.removeAttribute(domyAttrName);

  function getExecutedValue() {
    return func({
      code: props.attr.value,
      returnResult: true,
      $state: props.$state,
      virtualParent: props.virtualParent,
      virtualElement: props.virtualElement,
      notifier: props.notifier
    });
  }

  switch (domyAttrName) {
    case 'd-text':
      $el.textContent = getExecutedValue();
      break;
    case 'd-html':
      $el.innerHTML = getExecutedValue();
      break;
    case 'd-show':
      ($el as HTMLElement).style.display = getExecutedValue() ? '' : 'none';
      break;
    case 'd-ref':
      if (props.$state.$refs[props.attr.value])
        throw new Error(`A ref with the name "${props.attr.value}" already exist.`);
      props.$state.$refs[props.attr.value] = $el;
      break;
    case 'd-if':
      dIf(props);
      break;
    case 'd-model':
      dModel(props);
      break;
    case 'd-for':
      dFor(props);
      break;
  }
}
