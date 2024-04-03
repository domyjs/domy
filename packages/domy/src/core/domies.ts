import { SPECIAL_ATTRIBUTES } from '../constants/specialAttributes';
import { func } from '../utils/evaluate';
import { AttrRendererProps } from '@domy/types';
import { dFor } from './attributes/for';
import { dModel } from './attributes/model';
import { dIf } from './attributes/if';

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
      attrName: props.attr.name,
      returnResult: true,
      $state: props.$state,
      virtualParent: props.virtualParent,
      virtualElement: props.virtualElement,
      notifier: props.notifier
    });
  }

  switch (domyAttrName) {
    case 'd-once':
      props.virtualElement.domiesAttributes = {};
      break;
    case 'd-text':
      $el.textContent = getExecutedValue();
      break;
    case 'd-html':
      $el.innerHTML = getExecutedValue();
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
