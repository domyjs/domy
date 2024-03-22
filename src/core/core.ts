import { func } from '@utils/func';
import { SPECIAL_ATTRIBUTES } from '../constants/specialAttributes';
import { Signal, StateObj } from './Signal';
import { VirtualElement, VirtualDom } from './VitualDom';
import { replaceElement } from '@utils/replaceElement';
import { isBindAttr, isDomyAttr, isEventAttr } from '@utils/isSpecialAttribute';

type Props = {
  virtualElement: VirtualElement;
  $state: Signal[];
  attr: { name: string; value: string };
};

export const DOMY = {
  $refs: {} as Record<string, Element>,
  $store: {},
  createState(name: string, state: StateObj) {
    new Signal(name, state);
  },
  initStore(state: StateObj) {
    // TODO
  }
};

export function binding(props: Props) {
  const domyAttrName = props.attr.name;

  const attrName = domyAttrName.slice(1);
  const executedValue = func({
    code: props.attr.value,
    returnResult: true,
    $state: props.$state,
    virtualElement: props.virtualElement
  });

  props.virtualElement.$el.removeAttribute(domyAttrName);
  props.virtualElement.$el.setAttribute(attrName, executedValue);
}

export function events(props: Props) {
  const domyAttrName = props.attr.name;

  const eventName = domyAttrName.slice(1);

  props.virtualElement.$el.removeAttribute(domyAttrName);
  props.virtualElement.$el.addEventListener(eventName, function (event) {
    const executedValue = func({
      code: props.attr.value,
      returnResult: true,
      $state: props.$state,
      virtualElement: props.virtualElement
    });
    if (typeof executedValue === 'function') executedValue(event);
  });
}

export function domies(props: Props) {
  const domyAttrName = props.attr.name as (typeof SPECIAL_ATTRIBUTES)[number];

  props.virtualElement.$el.removeAttribute(domyAttrName);

  function getExecutedValue() {
    return func({
      code: props.attr.value,
      returnResult: true,
      $state: props.$state,
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
      (props.virtualElement.$el as HTMLElement).style.display = getExecutedValue()
        ? 'block'
        : 'none';
      break;
    case 'd-show':
      (props.virtualElement.$el as HTMLElement).style.display = getExecutedValue()
        ? 'block'
        : 'none';
      break;
    case 'd-ref':
      DOMY.$refs[props.attr.value] = props.virtualElement.$el;
      break;
    case 'd-model':
      // TODO
      break;
    case 'd-for':
      // TODO
      break;
  }
}

const $state: Signal[] = [];

export function renderElement(virtualElement: VirtualElement | string) {
  if (typeof virtualElement === 'string') return;

  const originalAttributes = virtualElement.$firstState.attributes;

  for (const attr of Object.keys(originalAttributes)) {
    const props: Props = {
      virtualElement,
      attr: { name: attr, value: originalAttributes[attr] },
      $state
    };

    if (attr === 'd-data') {
      const obj = func({
        code: originalAttributes[attr],
        $state: $state,
        returnResult: true,
        virtualElement
      });

      // Fixe state scope
      for (const key of Object.keys(obj)) {
        $state.push(new Signal(key, obj[key]));
      }

      virtualElement.$el.removeAttribute('d-data');
    } else if (isBindAttr(attr)) {
      binding(props);
    } else if (isEventAttr(attr)) {
      events(props);
    } else if (isDomyAttr(attr)) {
      domies(props);
    }
  }
}
